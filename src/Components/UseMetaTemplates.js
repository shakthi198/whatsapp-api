// src/components/UseMetaTemplates.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiChevronRight, HiChevronLeft, HiSearch, HiRefresh } from "react-icons/hi";
import { FaEye, FaFilter, FaList } from "react-icons/fa";
import apiEndpoints from "../apiconfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const normalizeUrl = (base, path) => {
  if (!base) return path;
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

const UseMetaTemplates = () => {
  const [metaTemplates, setMetaTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const templatesPerPage = 8;
  const navigate = useNavigate();

  // Build a safe URL
  const apiBase = apiEndpoints?.base || "";
  const metaTemplatesPath = apiEndpoints?.metaTemplates || "/whatsapp_admin/meta_templates.php";
  const url = apiBase ? normalizeUrl(apiBase, metaTemplatesPath) : metaTemplatesPath;

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

      if (!response.ok) {
        const text = await response.text();
        const snippet = (text || "").slice(0, 1000);
        const message = `HTTP ${response.status} ${response.statusText}`;
        console.error("[UseMetaTemplates] non-ok response:", message, response);
        throw new Error(message);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        const text = await response.text();
        const snippet = (text || "").slice(0, 1000);
        const message = `Expected JSON but server returned "${contentType}"`;
        console.error("[UseMetaTemplates] invalid content-type:", message, response);
        throw new Error(message);
      }

      const data = await response.json();

      const normalizeTemplate = (t) => {
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

        const attributesList = Array.isArray(attributes)
          ? attributes.map((a, idx) => {
              if (!a) return `param${idx + 1}`;
              if (typeof a === "string") return a;
              if (a.name) return a.name;
              if (a.text) return a.text;
              if (a.key) return a.key;
              if (a.type) return a.type;
              return JSON.stringify(a);
            })
          : [String(attributes)];

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

      let items = [];

      if (data && data.status === "success" && data.byCategory && typeof data.byCategory === "object") {
        const categories = Object.keys(data.byCategory);
        const allTemplates = [];
        
        categories.forEach(category => {
          const categoryTemplates = data.byCategory[category];
          if (Array.isArray(categoryTemplates)) {
            categoryTemplates.forEach(template => {
              allTemplates.push({
                ...normalizeTemplate(template),
                category: category
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
        items = data.data.templates.map(normalizeTemplate);
      } else {
        if (data && typeof data === "object") {
          const arraysFound = Object.values(data).filter((v) => Array.isArray(v));
          if (arraysFound.length > 0) {
            items = arraysFound.flat().map(normalizeTemplate);
          }
        }
      }

      if (!items || items.length === 0) {
        console.warn("[UseMetaTemplates] unexpected JSON shape:", data);
        setMetaTemplates([]);
        setError("No templates found in the response. Check console for details.");
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

  const apiUrlDisplay = url || "(apiEndpoints.metaTemplates is not defined)";

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 min-h-screen" style={{ fontFamily: "Montserrat" }}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen" style={{ fontFamily: "Montserrat" }}>
      <div className="bg-white p-4 rounded-lg shadow border border-gray-300">
        {/* Header Section - Responsive */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">Choose a Meta Template</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[200px]">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 flex items-center gap-2 justify-center"
            >
              <FaFilter className="text-sm" />
              Filters
            </button>
            
            {/* Refresh Button */}
            <button
              onClick={fetchMetaTemplates}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
            >
              <HiRefresh className="text-lg" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Tabs - Responsive */}
        <div className="mb-6 border-b border-gray-200 relative">
          {/* Mobile Category Dropdown */}
          <div className="md:hidden mb-4">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)} 
                  {category !== "all" && ` (${metaTemplates.filter(t => t.category === category).length})`}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Category Tabs */}
          <div className="hidden md:flex flex-wrap gap-1 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category
                    ? "bg-yellow-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)} 
                {category !== "all" && (
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    activeCategory === category ? "bg-yellow-500" : "bg-gray-300"
                  }`}>
                    {metaTemplates.filter(t => t.category === category).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-sm text-red-800 mb-6">
            <div className="font-semibold mb-2 flex items-center gap-2">
              <span>⚠️</span>
              Error fetching templates
            </div>
            <div className="whitespace-pre-wrap break-words">{error}</div>
            <div className="text-xs text-gray-600 mt-2 break-all">
              Endpoint: <code className="bg-gray-100 px-1 rounded">{apiUrlDisplay}</code>
            </div>
            <div className="mt-3">
              <button
                onClick={fetchMetaTemplates}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
          <FaList className="text-gray-400" />
          Showing {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== "all" && ` in ${activeCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>

        {/* Templates Grid - Fixed Card Layout */}
        {currentItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg font-medium mb-2">No templates found</p>
            <p className="text-sm">
              {activeCategory !== "all" && `No templates in ${activeCategory} category`}
              {searchQuery && ` matching "${searchQuery}"`}
              {!searchQuery && activeCategory === "all" && "Try refreshing or check your connection"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentItems.map((t) => (
              <div
                key={t.meta_template_id || t.name}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow flex flex-col min-h-0" // Changed to min-h-0
              >
                {/* Template Header - Fixed with proper containment */}
                <div className="flex justify-between items-start mb-3 flex-shrink-0">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight flex-1 min-w-0 pr-2 break-words">
                    {t.name}
                  </h3>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                      {t.language?.code ?? "en"}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded capitalize whitespace-nowrap">
                      {t.category}
                    </span>
                  </div>
                </div>

                {/* Template Body - Scrollable if needed */}
                <div className="flex-1 min-h-0 overflow-hidden mb-3">
                  <div className="text-sm text-gray-600 leading-relaxed max-h-20 overflow-y-auto">
                    {t.body || "No content available"}
                  </div>
                </div>

                {/* Template Footer */}
                {t.footer && (
                  <div className="text-xs text-gray-500 border-t pt-2 mt-2 flex-shrink-0">
                    <div className="line-clamp-2 break-words">{t.footer}</div>
                  </div>
                )}

                {/* Parameters - Fixed height with scroll */}
                {t.attributes && t.attributes.length > 0 && (
                  <div className="mt-3 text-xs text-gray-700 flex-shrink-0">
                    <div className="font-medium mb-1">Parameters:</div>
                    <div className="max-h-16 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(t.attributes) 
                          ? t.attributes.slice(0, 6).map((attr, idx) => (
                              <span 
                                key={idx} 
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs break-words max-w-full"
                                title={attr}
                              >
                                {attr.length > 20 ? `${attr.substring(0, 20)}...` : attr}
                              </span>
                            ))
                          : (
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs break-words">
                              {JSON.stringify(t.attributes).length > 30 
                                ? `${JSON.stringify(t.attributes).substring(0, 30)}...` 
                                : JSON.stringify(t.attributes)
                              }
                            </span>
                          )
                        }
                        {t.attributes.length > 6 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            +{t.attributes.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Always at bottom */}
                <div className="mt-4 flex gap-2 pt-3 border-t border-gray-100 flex-shrink-0">
                  <button
                    onClick={() => handleUse(t)}
                    className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => {
                      navigate("/create-template", { state: { template: t, previewOnly: true } });
                    }}
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0"
                    title="Preview"
                  >
                    <FontAwesomeIcon icon={faEye} className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - Responsive */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              Showing {start + 1} to {Math.min(start + templatesPerPage, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <HiChevronLeft className="text-xl" />
              </button>
              
              {/* Mobile page indicator */}
              <div className="md:hidden border border-yellow-600 px-4 py-2 rounded-lg text-black font-medium min-w-[60px] text-center">
                {currentPage}/{totalPages}
              </div>
              
              {/* Desktop page numbers */}
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-yellow-600 text-white"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <HiChevronRight className="text-xl" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add custom CSS for better text containment */}
      <style jsx>{`
        .break-words {
          word-wrap: break-word;
          word-break: break-word;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default UseMetaTemplates;