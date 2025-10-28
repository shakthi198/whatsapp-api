// src/components/UseMetaTemplates.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";
import apiEndpoints from "../apiconfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const UseMetaTemplates = () => {
  const [metaTemplates, setMetaTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const templatesPerPage = 8;
  const navigate = useNavigate();

  // Improved fetch with content-type & non-JSON handling
  const fetchMetaTemplates = async () => {
    setIsLoading(true);
    setError(null);

    const url = apiEndpoints.metaTemplates;
    console.info("[UseMetaTemplates] fetching meta templates from:", url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      // If server returned non-2xx, read text (might be HTML error page)
      if (!response.ok) {
        const text = await response.text();
        // show a helpful partial snippet
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

      if (data && data.status === "success" && Array.isArray(data.data)) {
        const items = data.data.map((t) => ({
          meta_template_id: t.id ?? t.meta_template_id ?? t.template_id ?? t.guid,
          name: t.name ?? t.template_name ?? t.title ?? "Unnamed",
          language: t.language ?? { code: t.lang ?? "en" },
          category: t.category ?? "General",
          body: t.body ?? t.template_body ?? t.templateBody ?? "",
          footer: t.footer ?? t.template_footer ?? "",
          components: t.components ?? t.template_components ?? [],
          attributes:
            t.attributes ||
            t.templateHeaders ||
            (t.components && t.components.find((c) => c.type === "body")?.parameters) ||
            [],
          raw: t,
          meta_status: t.meta_status ?? t.status ?? "UNKNOWN",
          createdOn: t.createdOn ?? t.created_at ?? new Date().toISOString(),
        }));
        setMetaTemplates(items);
      } else if (data && Array.isArray(data)) {
        // sometimes API returns array directly
        const items = data.map((t) => ({
          meta_template_id: t.id ?? t.meta_template_id ?? t.template_id ?? t.guid,
          name: t.name ?? t.template_name ?? t.title ?? "Unnamed",
          language: t.language ?? { code: t.lang ?? "en" },
          category: t.category ?? "General",
          body: t.body ?? t.template_body ?? t.templateBody ?? "",
          footer: t.footer ?? t.template_footer ?? "",
          components: t.components ?? t.template_components ?? [],
          attributes:
            t.attributes ||
            t.templateHeaders ||
            (t.components && t.components.find((c) => c.type === "body")?.parameters) ||
            [],
          raw: t,
          meta_status: t.meta_status ?? t.status ?? "UNKNOWN",
          createdOn: t.createdOn ?? t.created_at ?? new Date().toISOString(),
        }));
        setMetaTemplates(items);
      } else {
        // unknown payload shape
        console.warn("[UseMetaTemplates] unexpected JSON shape:", data);
        setMetaTemplates([]);
        setError("Received unexpected response format from server (not a templates list). Check console for details.");
      }
    } catch (err) {
      console.error("[UseMetaTemplates] fetch error:", err);
      setError(err.message || "Failed to fetch meta templates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetaTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = metaTemplates.filter((t) =>
    (t.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / templatesPerPage);
  const start = (currentPage - 1) * templatesPerPage;
  const currentItems = filtered.slice(start, start + templatesPerPage);

  const handleUse = (template) => {
    navigate("/create-template", { state: { template } });
  };

  // Quick helper UI to show the API URL being called (useful to debug)
  const apiUrlDisplay = apiEndpoints.metaTemplates || "(apiEndpoints.metaTemplates is not defined)";

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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

        {currentItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No templates found</div>
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
                  <div className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                    {t.body || "-"}
                  </div>
                  {t.footer && (
                    <div className="text-xs text-gray-500 mt-2 border-t pt-2">{t.footer}</div>
                  )}
                  {t.attributes && t.attributes.length > 0 && (
                    <div className="mt-3 text-xs text-gray-700">
                      <strong>Params:</strong>{" "}
                      {Array.isArray(t.attributes)
                        ? t.attributes.map((a) => a.name || a.text || a.key).join(", ")
                        : JSON.stringify(t.attributes)}
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
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {filtered.length === 0 ? 0 : start + 1} to{" "}
            {Math.min(start + templatesPerPage, filtered.length)} of {filtered.length}
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
      </div>
    </div>
  );
};

export default UseMetaTemplates;
