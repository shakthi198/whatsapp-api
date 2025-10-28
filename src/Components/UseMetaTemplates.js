// src/components/UseMetaTemplates.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";
import apiEndpoints from "../apiconfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const normalizeUrl = (base, path) => {
  if (!base) return path;
  // remove trailing slash from base and leading slash from path then join
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

const UseMetaTemplates = () => {
  const [metaTemplates, setMetaTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const templatesPerPage = 8;
  const navigate = useNavigate();

  // Build a safe URL (avoids double slashes)
  const apiBase = apiEndpoints?.base || ""; // optional base in apiconfig
  const metaTemplatesPath = apiEndpoints?.metaTemplates || "/whatsapp_admin/meta_templates.php";
  const url = apiBase ? normalizeUrl(apiBase, metaTemplatesPath) : metaTemplatesPath;

  // Improved fetch with content-type & non-JSON handling
  const fetchMetaTemplates = async () => {
    setIsLoading(true);
    setError(null);

    console.info("[UseMetaTemplates] fetching meta templates from:", url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      // If server returned non-2xx, read text (might be HTML error page)
      if (!response.ok) {
        const text = await response.text();
        const snippet = (text || "").slice(0, 1000);
        const message = `HTTP ${response.status} ${response.statusText} - response not OK. Response snippet: ${snippet}`;
        console.error("[UseMetaTemplates] non-ok response:", message, response);
        throw new Error(message);
      }

      // Check content-type; if not JSON, read text and throw nice error
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        const text = await response.text();
        const snippet = (text || "").slice(0, 1000);
        const message = `Expected JSON but server returned "${contentType}". Response snippet: ${snippet}`;
        console.error("[UseMetaTemplates] invalid content-type:", message, response);
        throw new Error(message);
      }

      // Safe to parse JSON
      const data = await response.json();

      // Helper to convert a raw template object into normalized shape
      const normalizeTemplate = (t) => {
        // attributes detection: try common shapes
        let attributes =
          t.attributes ||
          t.templateHeaders ||
          t.templateHeaders?.parameters ||
          t.parameters ||
          (t.components &&
            [].concat(
              ...t.components
                .filter((c) => c && c.type && c.type.toLowerCase() === "body")
                .map((c) => c.parameters || [])
            )) ||
          [];

        // Normalize attribute list to array of readable names
        const attributesList = Array.isArray(attributes)
          ? attributes.map((a, idx) => {
              if (!a) return `param${idx + 1}`;
              // Many shapes: {name}, {text}, {key}, or string
              if (typeof a === "string") return a;
              if (a.name) return a.name;
              if (a.text) return a.text;
              if (a.key) return a.key;
              if (a.type) return a.type;
              // fallback to stringify
              return JSON.stringify(a);
            })
          : [String(attributes)];

        // Find body/footer/header text if present
        const components = t.components || [];
        let body = t.body ?? t.template_body ?? "";
        let footer = t.footer ?? t.template_footer ?? "";
        if ((!body || body === "") && Array.isArray(components)) {
          const bodyComp = components.find((c) => (c.type || "").toLowerCase() === "body");
          if (bodyComp) {
            body = bodyComp.text ?? bodyComp.body ?? "";
            if (!body && Array.isArray(bodyComp.parameters)) {
              body = bodyComp.parameters
                .map((p) => (p.text ? p.text : p.name ? `{{${p.name}}}` : "{{param}}"))
                .join(" ");
            }
          }
          const footerComp = components.find((c) => (c.type || "").toLowerCase() === "footer");
          if (footerComp) footer = footerComp.text ?? footerComp.footer ?? footer;
        }

        return {
          meta_template_id: t.id ?? t.meta_template_id ?? t.template_id ?? t.guid,
          name: t.name ?? t.template_name ?? t.title ?? "Unnamed",
          language: typeof t.language === "string" ? { code: t.language } : t.language ?? { code: "en" },
          category: t.category ?? t.category_raw ?? t.category_name ?? "General",
          body: body || "",
          footer: footer || "",
          components: components,
          attributes: attributesList,
          raw: t,
          meta_status: t.meta_status ?? t.status ?? "UNKNOWN",
          createdOn: t.createdOn ?? t.created_at ?? new Date().toISOString(),
        };
      };

      // Accept multiple plausible response shapes:
      // 1) { status: "success", byCategory: { cat1: [...], cat2: [...] } }
      // 2) { status: "success", data: [...] }
      // 3) Array directly: [...]
      // 4) { ... } single object (fallback -> wrap)
      let items = [];

      if (data && data.status === "success" && data.byCategory && typeof data.byCategory === "object") {
        // flatten byCategory but preserve category info
        const categories = Object.keys(data.byCategory);
        const allTemplates = [];
        
        categories.forEach(category => {
          const categoryTemplates = data.byCategory[category];
          if (Array.isArray(categoryTemplates)) {
            categoryTemplates.forEach(template => {
              allTemplates.push({
                ...normalizeTemplate(template),
                category: category // Ensure category is set from the grouped data
              });
            });
          }
        });
        
        items = allTemplates;
      } else if (data && data.status === "success" && Array.isArray(data.data)) {
        items = data.data.map(normalizeTemplate);
      } else if (Array.isArray(data)) {
        items = data.map(normalizeTemplate);
      } else if (data && typeof data === "object" && data.data && Array.isArray(data.data.templates)) {
        // some responses may nest templates under data.templates
        items = data.data.templates.map(normalizeTemplate);
      } else {
        // unknown shape: try to salvage if object contains templates grouped by keys
        if (data && typeof data === "object") {
          // attempt to find any array values inside the object
          const arraysFound = Object.values(data).filter((v) => Array.isArray(v));
          if (arraysFound.length > 0) {
            items = arraysFound.flat().map(normalizeTemplate);
            console.warn("[UseMetaTemplates] salvaged templates from nested arrays in response");
          }
        }
      }

      if (!items || items.length === 0) {
        // If we couldn't parse templates, show a helpful warning (but don't treat as fatal)
        console.warn("[UseMetaTemplates] unexpected JSON shape:", data);
        setMetaTemplates([]);
        setError("Received unexpected response format from server (no templates found). Check console for details.");
      } else {
        setMetaTemplates(items);
      }
    } catch (err) {
      console.error("[UseMetaTemplates] fetch error:", err);
      setError(err.message || "Failed to fetch meta templates");
      setMetaTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetaTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get unique categories from templates
  const categories = ["all", ...new Set(metaTemplates.map(t => t.category).filter(Boolean))];
  
  // Filter templates based on search and active category
  const filtered = metaTemplates.filter((t) => {
    const matchesSearch = (t.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / templatesPerPage));
  const start = (currentPage - 1) * templatesPerPage;
  const currentItems = filtered.slice(start, start + templatesPerPage);

  const handleUse = (template) => {
    navigate("/create-template", { state: { template } });
  };

  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  // Quick helper UI to show the API URL being called (useful to debug)
  const apiUrlDisplay = url || "(apiEndpoints.metaTemplates is not defined)";

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100" style={{ fontFamily: "Montserrat" }}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100" style={{ fontFamily: "Montserrat" }}>
      <div className="bg-white p-4 rounded shadow border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Choose a Meta Template</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search meta templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded"
            />
            <button
              onClick={() => fetchMetaTemplates()}
              className="bg-blue-600 text-white px-3 py-2 rounded"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-yellow-600 text-white border-b-2 border-yellow-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)} 
                {category !== "all" && (
                  <span className="ml-2 text-xs bg-gray-300 px-1.5 py-0.5 rounded-full">
                    {metaTemplates.filter(t => t.category === category).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Show error with more details for debugging */}
        {error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-800 mb-4">
            <div className="font-semibold mb-2">Error fetching meta templates</div>
            <div className="whitespace-pre-wrap break-words">{error}</div>
            <div className="text-xs text-gray-600 mt-2">
              Endpoint: <code>{apiUrlDisplay}</code>
            </div>
            <div className="mt-2">
              <button
                onClick={fetchMetaTemplates}
                className="bg-yellow-600 text-white px-3 py-1 rounded"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {/* Category info and template count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== "all" && ` in ${activeCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {currentItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No templates found
            {activeCategory !== "all" && ` in ${activeCategory} category`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((t) => (
              <div
                key={t.meta_template_id || t.name}
                className="border rounded p-4 bg-gray-50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <span className="text-xs text-gray-500">{t.language?.code ?? "en"}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Category: <span className="font-medium">{t.category}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                    {t.body || "-"}
                  </div>
                  {t.footer && (
                    <div className="text-xs text-gray-500 mt-2 border-t pt-2">{t.footer}</div>
                  )}
                  {t.attributes && t.attributes.length > 0 && (
                    <div className="mt-3 text-xs text-gray-700">
                      <strong>Params:</strong>{" "}
                      {Array.isArray(t.attributes) ? t.attributes.join(", ") : JSON.stringify(t.attributes)}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleUse(t)}
                    className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => {
                      navigate("/create-template", { state: { template: t, previewOnly: true } });
                    }}
                    className="border border-gray-300 px-3 py-2 rounded"
                    title="Preview"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* pagination */}
        {filtered.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Showing {start + 1} to {Math.min(start + templatesPerPage, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-300 disabled:opacity-50"
              >
                <HiChevronLeft className="text-2xl" />
              </button>
              <div className="border border-yellow-600 px-4 py-2 rounded-md text-black font-medium">
                {currentPage}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-300 disabled:opacity-50"
              >
                <HiChevronRight className="text-2xl" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UseMetaTemplates;