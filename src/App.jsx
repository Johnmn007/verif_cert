import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSearch,
  FileText,
  Globe,
  History,
  Image,
  KeyRound,
  LockKeyhole,
  LogOut,
  Menu,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const API_URL_STORAGE_KEY = "sicv_custom_api_url";

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem(API_URL_STORAGE_KEY);
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, "");
    }
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "http://localhost:8000/api/v1";
}

const API_BASE_URL = getApiBaseUrl();
const ADMIN_TOKEN_STORAGE_KEY = "sicv_admin_token";

const fallbackCertificates = [
  {
    token: "SICV-2026-000152",
    holder: "Maria Lopez Garcia",
    maskedDocument: "DNI ****4821",
    title: "Certificado de capacitacion",
    program: "Gestion Administrativa",
    issuer: "Institucion Educativa Demo",
    issuedOn: "2026-09-15",
    expiresOn: null,
    status: "PUBLICADO",
    origin: "NUEVO",
    reviewer: "Dra. Ana Torres",
    disclosure: "Nombre, codigo, titulo, institucion, fecha y estado",
  },
  {
    token: "SICV-2024-000044",
    holder: "Carlos Mendoza Rios",
    maskedDocument: "DNI ****1140",
    title: "Constancia historica de estudios",
    program: "Educacion Continua",
    issuer: "Institucion Educativa Demo",
    issuedOn: "2024-05-22",
    expiresOn: null,
    status: "REEMPLAZADO",
    origin: "HISTORICO",
    reviewer: "Lic. Ruben Salas",
    disclosure: "Estado no valido, codigo y canal de consulta",
  },
  {
    token: "SICV-2025-000091",
    holder: "Lucia Herrera Diaz",
    maskedDocument: "DNI ****7630",
    title: "Certificado tecnico",
    program: "Soporte Informatico",
    issuer: "Institucion Educativa Demo",
    issuedOn: "2025-11-08",
    expiresOn: "2027-11-08",
    status: "REVOCADO",
    origin: "NUEVO",
    reviewer: "Dra. Ana Torres",
    disclosure: "Estado no valido, codigo y canal de consulta",
  },
];

const fallbackReviewQueue = [
  {
    id: "REV-1038",
    holder: "Rosa Quispe Mallqui",
    title: "Certificado de capacitacion",
    origin: "NUEVO",
    status: "EN_REVISION",
    updated: "Hace 18 min",
    risk: "Politica activa",
  },
  {
    id: "REV-1037",
    holder: "Miguel Paredes Soto",
    title: "Certificado historico",
    origin: "HISTORICO",
    status: "OBSERVADO",
    updated: "Hace 2 h",
    risk: "Falta evidencia",
  },
  {
    id: "REV-1035",
    holder: "Elena Vargas Leon",
    title: "Constancia de estudios",
    origin: "NUEVO",
    status: "APROBADO",
    updated: "Ayer",
    risk: "Listo para publicar",
  },
];

const fallbackAuditEvents = [
  ["15:42", "PUBLICAR", "SICV-2026-000152", "Dra. Ana Torres"],
  ["15:39", "ACTIVAR_POLITICA", "Divulgacion v3", "Legal + Direccion"],
  ["14:11", "SUBIR_DOCUMENTO", "REV-1038", "Operador certificacion"],
  ["12:20", "REVOCAR", "SICV-2025-000091", "Dra. Ana Torres"],
  ["10:04", "BUSQUEDA_INTERNA", "DNI protegido", "Operador certificacion"],
];

const navItems = [
  { id: "dashboard", label: "Panel", icon: BarChart3 },
  { id: "bulk", label: "Carga Masiva", icon: Upload },
  { id: "review", label: "Revision", icon: ClipboardCheck },
  { id: "policies", label: "Politicas", icon: ShieldCheck },
  { id: "audit", label: "Auditoria", icon: History },
];

const statusStyles = {
  PUBLICADO: "border-emerald-200 bg-emerald-50 text-emerald-700",
  APROBADO: "border-sky-200 bg-sky-50 text-sky-700",
  EN_REVISION: "border-amber-200 bg-amber-50 text-amber-700",
  OBSERVADO: "border-orange-200 bg-orange-50 text-orange-700",
  REVOCADO: "border-red-200 bg-red-50 text-red-700",
  REEMPLAZADO: "border-slate-200 bg-slate-100 text-slate-700",
};

const statusDescriptions = {
  BORRADOR: "Aun no enviado a revision.",
  EN_REVISION: "Pendiente de aprobacion.",
  OBSERVADO: "Requiere correccion.",
  APROBADO: "Listo para publicar.",
  PUBLICADO: "Visible en consulta publica.",
  REVOCADO: "Ya no es valido.",
  REEMPLAZADO: "Fue sustituido por otro certificado.",
};

const fallbackPolicy = {
  version: 3,
  descripcion: "Nombre, codigo, titulo, institucion, fecha y estado",
  mostrar_codigo: true,
  mostrar_nombre: true,
  mostrar_documento: false,
  mostrar_fechas: true,
  mostrar_programa: true,
  permitir_documento_completo: false,
};

const fallbackSummary = {
  published: 1284,
  in_review: 17,
  active_policies: 6,
  revoked: 9,
};

const fallbackCatalog = {
  holders: [],
  types: [],
  titles: [
    { title: "Diplomado en Gestión Pública y Transformación Digital", program: "Programa de Especialización Continua 2026" },
    { title: "Certificado de Capacitación", program: "Gestión Administrativa" },
    { title: "Certificado Técnico de Especialización", program: "Soporte Informático" },
    { title: "Constancia de Participación", program: "Educación Continua" },
    { title: "Constancia Histórica de Estudios", program: "Formación Profesional" },
  ],
};

const fallbackBulkHistory = [];

function normalizeCertificate(certificate) {
  return {
    id: certificate.id,
    code: certificate.code,
    token: certificate.token ?? certificate.code,
    holder: certificate.holder,
    holderId: certificate.holder_id ?? certificate.holderId,
    holderNames: certificate.holder_names ?? certificate.holderNames ?? "",
    holderSurnames: certificate.holder_surnames ?? certificate.holderSurnames ?? "",
    holderDocType: certificate.holder_doc_type ?? certificate.holderDocType ?? "DNI",
    holderDocNumber: certificate.holder_doc_number ?? certificate.holderDocNumber ?? "",
    typeId: certificate.type_id ?? certificate.typeId ?? "",
    maskedDocument: certificate.masked_document ?? certificate.maskedDocument,
    title: certificate.title,
    program: certificate.program,
    issuer: certificate.issuer,
    issuedOn: certificate.issued_on ?? certificate.issuedOn,
    expiresOn: certificate.expires_on ?? certificate.expiresOn,
    status: certificate.status,
    origin: certificate.origin,
    reviewer: certificate.reviewer,
    disclosure: certificate.disclosure,
    hasDocument: Boolean(certificate.has_document ?? certificate.hasDocument),
    documentPublic: Boolean(certificate.document_public ?? certificate.documentPublic),
    hasQr: certificate.has_qr ?? certificate.hasQr ?? false,
    qrUrl: certificate.qr_url ?? certificate.qrUrl,
  };
}

async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const adminToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  const adminHeaders = path.startsWith("/admin") && adminToken ? { "X-Admin-Token": adminToken } : {};
  const baseUrl = getApiBaseUrl();
  const targetUrl = path === "/health"
    ? (baseUrl.endsWith("/api/v1") ? baseUrl.replace(/\/api\/v1$/, "/health") : `${baseUrl}/health`)
    : `${baseUrl}${path}`;
  const response = await fetch(targetUrl, {
    headers: isFormData
      ? { ...adminHeaders, ...(options.headers ?? {}) }
      : {
          "Content-Type": "application/json",
          ...adminHeaders,
          ...(options.headers ?? {}),
        },
    ...options,
  });
  if (!response.ok) {
    let detail = `API ${response.status}`;
    try {
      const payload = await response.json();
      detail = payload.detail ?? detail;
    } catch {
      // Keep default detail when response is not JSON.
    }
    throw new Error(detail);
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType && !contentType.includes("application/json") && !contentType.includes("problem+json")) {
    throw new Error("El endpoint respondió con HTML en lugar de JSON. Verifica que la URL del backend apunte a la API FastAPI y no al frontend estático.");
  }
  return response.json();
}

function useApiData(path, fallbackValue, refreshKey = 0) {
  const [data, setData] = useState(fallbackValue);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    apiRequest(path)
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setUsingFallback(false);
        setErrorDetail("");
      })
      .catch((err) => {
        if (!active) return;
        setData(fallbackValue);
        setUsingFallback(true);
        setErrorDetail(err?.message || "Error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [path, fallbackValue, refreshKey]);

  return { data, loading, usingFallback, errorDetail };
}

function useProtectedBlob(path, enabled = true, refreshKey = 0) {
  const [blobUrl, setBlobUrl] = useState("");
  const [contentType, setContentType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !path) {
      setBlobUrl("");
      setContentType("");
      setError("");
      return undefined;
    }

    let active = true;
    let objectUrl = "";
    const adminToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);

    fetch(`${getApiBaseUrl()}${path}`, {
      headers: adminToken ? { "X-Admin-Token": adminToken } : {},
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        setContentType(response.headers.get("Content-Type") ?? "");
        return response.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setBlobUrl("");
        setContentType("");
        setError("No se pudo cargar el recurso protegido.");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, enabled, refreshKey]);

  return { blobUrl, contentType, error };
}

function usePublicBlob(path, enabled = true, refreshKey = 0) {
  const [blobUrl, setBlobUrl] = useState("");
  const [contentType, setContentType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !path) {
      setBlobUrl("");
      setContentType("");
      setError("");
      return undefined;
    }

    let active = true;
    let objectUrl = "";

    fetch(`${getApiBaseUrl()}${path}`)
      .then(async (response) => {
        if (!response.ok) {
          let errorDetail = `HTTP ${response.status}`;
          try {
            const data = await response.json();
            if (data?.detail) errorDetail = data.detail;
          } catch {
            // ignore
          }
          throw new Error(errorDetail);
        }
        setContentType(response.headers.get("Content-Type") ?? "");
        return response.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setBlobUrl("");
        setContentType("");
        if (err.message === "document_not_available") {
          setError("El documento digital está restringido por la política institucional de privacidad.");
        } else if (err.message === "document_file_missing") {
          setError("El archivo original no se encontró en el almacenamiento del servidor. Se requiere recarga en el expediente institucional.");
        } else {
          setError("No se pudo cargar la vista previa del documento.");
        }
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, enabled, refreshKey]);

  return { blobUrl, contentType, error };
}

function PdfCanvasViewer({ blobUrl, title, alt }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    const renderPdfPage = async () => {
      try {
        let pdfjs = window.pdfjsLib;
        if (!pdfjs) {
          await new Promise((resolve, reject) => {
            if (document.querySelector('script[data-pdfjs]')) {
              const checkInterval = setInterval(() => {
                if (window.pdfjsLib) {
                  clearInterval(checkInterval);
                  resolve();
                }
              }, 50);
              setTimeout(() => {
                clearInterval(checkInterval);
                if (window.pdfjsLib) resolve();
                else reject(new Error("Timeout loading PDF.js"));
              }, 6000);
              return;
            }
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.async = true;
            script.setAttribute("data-pdfjs", "true");
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load PDF library"));
            document.head.appendChild(script);
          });
          pdfjs = window.pdfjsLib;
          if (pdfjs) {
            pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          }
        }

        if (!active || !pdfjs) return;

        const loadingTask = pdfjs.getDocument(blobUrl);
        const pdf = await loadingTask.promise;
        if (!active) return;
        setNumPages(pdf.numPages);

        const pdfPage = await pdf.getPage(page);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const containerWidth = canvas.parentElement?.clientWidth || 700;
        const unscaledViewport = pdfPage.getViewport({ scale: 1 });
        const targetScale = Math.min(2.0, Math.max(1.0, containerWidth / unscaledViewport.width));
        const viewport = pdfPage.getViewport({ scale: targetScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore
          }
        }

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = pdfPage.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (active) setLoading(false);
      } catch (err) {
        if (err?.name === "RenderingCancelledException") return;
        if (active) {
          console.warn("PDF render fallback:", err);
          setError(true);
          setLoading(false);
        }
      }
    };

    renderPdfPage();

    return () => {
      active = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [blobUrl, page]);

  if (error) {
    return (
      <div className="grid min-h-[360px] place-items-center bg-slate-50 p-6 text-center">
        <div>
          <FileText className="mx-auto h-12 w-12 text-civic" />
          <p className="mt-3 font-semibold text-ink">Certificado digital (PDF)</p>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            El archivo está disponible y validado en el sistema. Puedes abrirlo directamente o descargarlo.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <a
              href={blobUrl}
              target="_blank"
              rel="noreferrer"
              className="primary-button text-xs py-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir documento PDF
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center bg-slate-50 p-3 sm:p-5 rounded-lg min-h-[380px]">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-xs rounded-lg p-4">
          <RefreshCw className="h-6 w-6 text-civic animate-spin" />
          <p className="mt-2 text-xs font-medium text-slate-600">Generando vista del documento...</p>
        </div>
      )}
      <div className="max-w-full overflow-hidden rounded-lg shadow-sm border border-slate-200/90 bg-white">
        <canvas
          ref={canvasRef}
          className="block max-h-[72vh] w-auto max-w-full object-contain"
          title={title}
          aria-label={alt || title}
        />
      </div>

      {numPages > 1 && (
        <div className="mt-3 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium shadow-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-slate-600 hover:text-ink disabled:opacity-40 cursor-pointer"
          >
            ← Anterior
          </button>
          <span className="text-slate-500 font-mono text-[11px]">
            {page} / {numPages}
          </span>
          <button
            type="button"
            disabled={page >= numPages}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            className="text-slate-600 hover:text-ink disabled:opacity-40 cursor-pointer"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

function CertificateDocumentPreview({ blobUrl, contentType, title, alt }) {
  const isImage = contentType.toLowerCase().startsWith("image/");

  if (isImage) {
    return (
      <div className="grid min-h-[360px] place-items-center bg-slate-50 p-3 sm:min-h-[420px]">
        <img
          className="block max-h-[70vh] max-w-full rounded-lg object-contain shadow-xs"
          src={blobUrl}
          alt={alt}
        />
      </div>
    );
  }

  return <PdfCanvasViewer blobUrl={blobUrl} title={title} alt={alt} />;
}

async function downloadProtectedFile(path, filename) {
  const adminToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: adminToken ? { "X-Admin-Token": adminToken } : {},
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function downloadTextFile(content, filename, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        statusStyles[value] ?? "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {value}
    </span>
  );
}

function StatusHint({ value }) {
  return <p className="mt-1 text-xs text-slate-500">{statusDescriptions[value] ?? "Estado registrado."}</p>;
}

function Notice({ tone = "info", children }) {
  const styles = {
    info: "border-slate-200 bg-white text-slate-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-red-200 bg-red-50 text-red-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return <div className={`rounded-lg border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>;
}

function WorkflowGuide() {
  const steps = [
    ["1", "Registrar titular", "Crea o selecciona a la persona certificada."],
    ["2", "Crear certificado", "Completa datos y adjunta imagen o PDF."],
    ["3", "Revisar y aprobar", "Envia a revision y registra aprobacion."],
    ["4", "Publicar y verificar", "Activa el codigo publico o QR oficial."],
  ];

  return (
    <section className="panel p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Flujo recomendado</h2>
          <p className="text-xs text-slate-500">Pasos secuenciales para emitir y verificar con trazabilidad completa.</p>
        </div>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4 snap-x">
        {steps.map(([number, title, text]) => (
          <div key={number} className="min-w-[220px] sm:min-w-0 snap-start flex-1 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-civic text-xs font-bold text-white shadow-sm">
                {number}
              </span>
              <p className="font-semibold text-ink text-sm">{title}</p>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, helper, tone = "text-civic" }) {
  return (
    <section className="panel p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-ink">{value}</p>
        </div>
        <div className={`rounded-lg bg-slate-100 p-2.5 ${tone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{helper}</p>
    </section>
  );
}

function Shell({ activeView, setActiveView, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeLabel = navItems.find((i) => i.id === activeView)?.label || (activeView === "settings" ? "Configuracion" : "Panel");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur shadow-xs">
        <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            className="icon-button lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir navegacion"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-civic text-white shadow-sm">
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-ink tracking-tight">SICV</p>
                <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-civic sm:inline-flex">
                  Produccion Oficial
                </span>
                <span className="lg:hidden rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 truncate max-w-[120px]">
                  {activeLabel}
                </span>
              </div>
              <p className="truncate text-xs text-slate-500">
                Sistema Institucional de Certificacion y Verificacion
              </p>
            </div>
          </div>
          <button className="icon-button" aria-label="Notificaciones">
            <Bell className="h-5 w-5" />
          </button>
          <button className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 sm:inline-flex shadow-xs hover:border-civic hover:text-civic transition">
            <UserRoundCheck className="h-4 w-4" />
            Autoridad
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1480px] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-slate-200/90 bg-white px-4 py-6 lg:block">
          <Navigation activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} />
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
              aria-label="Cerrar navegacion"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="relative flex flex-col h-full w-[min(86vw,320px)] bg-white p-5 shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-civic text-white shadow-sm">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">SICV</p>
                    <p className="text-[11px] text-slate-500">Panel Institucional</p>
                  </div>
                </div>
                <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Cerrar">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Navigation
                  activeView={activeView}
                  onLogout={() => {
                    onLogout();
                    setMenuOpen(false);
                  }}
                  setActiveView={(view) => {
                    setActiveView(view);
                    setMenuOpen(false);
                  }}
                />
              </div>
              <div className="mt-auto border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                SICV • Sistema de Certificacion Institucional
              </div>
            </aside>
          </div>
        )}

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function Navigation({ activeView, setActiveView, onLogout }) {
  return (
    <nav className="space-y-1" aria-label="Principal">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.id === activeView;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
              active ? "bg-civic text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
      <div className="my-5 border-t border-slate-200" />
      <button
        className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold ${
          activeView === "settings" ? "bg-civic text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
        }`}
        onClick={() => setActiveView("settings")}
      >
        <Settings className="h-5 w-5" aria-hidden="true" />
        Configuracion
      </button>
      <button
        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-ink"
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        Salir
      </button>
    </nav>
  );
}

function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/90 bg-white shadow-xs">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-civic text-white shadow-sm">
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink tracking-tight">SICV</p>
              <p className="truncate text-xs text-slate-500">Verificacion publica de certificados</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Portal Oficial</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}

function VerifyView() {
  const getInitialToken = () => {
    if (typeof window === "undefined") return "";
    const path = window.location.pathname;
    if (path.startsWith("/v/")) {
      return decodeURIComponent(path.replace("/v/", "").replace(/\/+$/, "")).trim();
    }
    if (path.startsWith("/verificar/")) {
      return decodeURIComponent(path.replace("/verificar/", "").replace(/\/+$/, "")).trim();
    }
    const params = new URLSearchParams(window.location.search);
    return (params.get("token") || params.get("code") || "").trim();
  };

  const initialToken = getInitialToken();
  const [query, setQuery] = useState(initialToken);
  const [submitted, setSubmitted] = useState(initialToken);
  const [result, setResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;
    const token = submitted.trim();
    if (!token) {
      setResult(null);
      return undefined;
    }

    setLookupLoading(true);
    fetch(`${getApiBaseUrl()}/public/certificates/${encodeURIComponent(token)}`)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`API ${response.status}`);
        }
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        if (payload) {
          setResult(normalizeCertificate(payload));
          setUsingFallback(false);
          return;
        }
        setResult(null);
        setUsingFallback(false);
      })
      .catch(() => {
        if (!active) return;
        const fallback = fallbackCertificates.find(
          (item) => item.token.toLowerCase() === token.toLowerCase(),
        );
        setResult(fallback ? normalizeCertificate(fallback) : null);
        setUsingFallback(true);
      })
      .finally(() => {
        if (active) setLookupLoading(false);
      });

    return () => {
      active = false;
    };
  }, [submitted]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Portal publico"
        title="Verificacion de certificados"
        description="Ingresa el codigo del certificado o escanea el QR para consultar el registro oficial sin exponer informacion sensible."
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="panel overflow-hidden">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(query);
              }}
            >
              <label className="sr-only" htmlFor="certificate-code">
                Codigo o token de certificado
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="certificate-code"
                  className="field pl-10"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ej. SICV-2026-000152"
                />
              </div>
              <button className="primary-button shrink-0 shadow-sm" type="submit">
                <FileSearch className="h-4 w-4" />
                {lookupLoading ? "Consultando..." : "Verificar"}
              </button>
            </form>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Ejemplo rapido:</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("SICV-2026-000152");
                  setSubmitted("SICV-2026-000152");
                }}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 hover:border-civic hover:text-civic transition"
              >
                SICV-2026-000152
              </button>
            </div>
            {usingFallback && (
              <p className="mt-3 text-xs font-medium text-amber-700">
                No se pudo conectar al servicio. Se muestra una respuesta de respaldo.
              </p>
            )}
          </div>

          {submitted ? (
            result ? (
              <CertificateResult certificate={result} />
            ) : (
              <NotFound code={submitted} />
            )
          ) : (
            <div className="grid min-h-[300px] place-items-center p-6 text-center">
              <div>
                <FileSearch className="mx-auto h-12 w-12 text-slate-400" />
                <h2 className="mt-4 text-lg font-semibold text-ink">Consulta un certificado</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Escribe el codigo institucional que aparece en el certificado. Si llegaste desde un QR, la
                  consulta se ejecutara automaticamente.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-5">
          <section className="panel p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-civic">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink">Verificacion por QR</h2>
                <p className="text-xs text-slate-500">Lectura directa desde cualquier telefono movil.</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-blue-50/30 p-5 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200/80 text-civic">
                <QrCode className="h-10 w-10" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">Escaneo instantaneo</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Apunta la camara de tu smartphone al codigo QR del diploma o certificado impreso para verificar su autenticidad oficial.
              </p>
            </div>
          </section>

          <section className="panel p-4 sm:p-5">
            <h2 className="text-base font-semibold text-ink">Protecciones activas</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Protection icon={LockKeyhole} text="Sin busqueda publica por DNI o nombres." />
              <Protection icon={ShieldCheck} text="Campos visibles definidos por politica activa." />
              <Protection icon={RefreshCw} text="Estado consultado en tiempo real, sin cache sensible." />
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function CertificateResult({ certificate }) {
  const valid = certificate.status === "PUBLICADO";
  const verifiedAt = new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const docToken = (certificate.token || certificate.code || "").trim();
  const publicDocumentPath = docToken ? `/public/certificates/${encodeURIComponent(docToken)}/document` : "";
  const canShowDocument = Boolean(valid && certificate.hasDocument && certificate.documentPublic);
  const publicDocument = usePublicBlob(publicDocumentPath, canShowDocument);

  return (
    <div className="p-4 sm:p-6">
      <div
        className={`rounded-lg border p-4 ${
          valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Resultado oficial de verificacion
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {valid ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-700" />
              ) : (
                <AlertTriangle className="h-7 w-7 text-danger" />
              )}
              <h2 className="text-xl font-semibold text-ink">
                {valid ? "Certificado vigente y verificable" : "Certificado no valido"}
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Consulta realizada el {verifiedAt}. El estado se obtiene directamente del registro institucional.
            </p>
            <StatusHint value={certificate.status} />
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusBadge value={certificate.status} />
            <span className="text-xs font-medium text-slate-500">
              Dominio oficial: {certificate.issuer_domain || certificate.issuer || window.location.hostname}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="max-w-2xl text-sm text-slate-500">
            Resultado obtenido desde el registro institucional. Un resultado no encontrado o no valido no
            debe interpretarse automaticamente como falsificacion.
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Info label="Codigo institucional" value={certificate.code ?? certificate.token} />
        <Info label="Titular" value={valid ? certificate.holder : "Restringido por politica"} />
        <Info label="Documento" value={certificate.maskedDocument ?? "No publico"} />
        <Info label="Certificado" value={certificate.title} />
        <Info label="Programa" value={certificate.program} />
        <Info label="Emisor" value={certificate.issuer} />
        <Info label="Fecha de emision" value={certificate.issuedOn} />
        <Info label="Vencimiento" value={certificate.expiresOn ?? "No aplica"} />
        <Info label="Origen" value={certificate.origin} />
      </dl>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-ink">Politica aplicada</p>
        <p className="mt-1 text-sm text-slate-600">{certificate.disclosure}</p>
      </div>

      {canShowDocument ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 px-4 py-3 bg-slate-50/70">
            <div>
              <p className="text-sm font-semibold text-ink">Documento oficial del certificado</p>
              <p className="text-xs text-slate-500">Visible porque la politica de divulgacion activa lo permite.</p>
            </div>
            {publicDocument.blobUrl && (
              <a
                href={publicDocument.blobUrl}
                download={`certificado-${certificate.code ?? certificate.token}.pdf`}
                className="secondary-button text-xs py-1"
                target="_blank"
                rel="noreferrer"
              >
                <Download className="h-3.5 w-3.5 text-civic" />
                Descargar original
              </a>
            )}
          </div>
          {publicDocument.blobUrl ? (
            <CertificateDocumentPreview
              blobUrl={publicDocument.blobUrl}
              contentType={publicDocument.contentType}
              title="Documento publico del certificado"
              alt={`Documento de ${certificate.title}`}
            />
          ) : (
            <div className="grid min-h-[360px] place-items-center bg-slate-50 p-6 text-center">
              <div>
                {publicDocument.error ? (
                  <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
                ) : (
                  <Image className="mx-auto h-10 w-10 text-slate-400 animate-pulse" />
                )}
                <p className="mt-3 font-semibold text-ink">
                  {publicDocument.error ? "No se pudo cargar la vista previa" : "Cargando documento"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {publicDocument.error || "Estamos preparando la vista previa del certificado."}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : !certificate.hasDocument ? (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <div>
            <span className="font-semibold text-slate-700">Sin archivo digital adjunto: </span>
            <span>Este certificado se encuentra publicado en el registro oficial, pero aún no tiene una copia digital (PDF/imagen) cargada en su expediente institucional.</span>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-civic" />
          <span>El documento digital existe en el registro, pero la politica activa no permite mostrarlo publicamente.</span>
        </div>
      )}
    </div>
  );
}

function NotFound({ code }) {
  return (
    <div className="p-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
          <div>
            <h2 className="font-semibold text-amber-900">Sin registro verificable</h2>
            <p className="mt-1 text-sm text-amber-800">
              No existe una ficha publica disponible para "{code}". Puede tratarse de un codigo incorrecto,
              un certificado aun no incorporado o un documento no publicado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ refreshKey, onRefresh }) {
  const certificatesResource = useApiData("/admin/certificates", fallbackCertificates, refreshKey);
  const summaryResource = useApiData("/admin/summary", fallbackSummary, refreshKey);
  const catalogResource = useApiData("/admin/catalog", fallbackCatalog, refreshKey);
  const healthResource = useApiData("/health", { status: "ok", database_connected: true }, refreshKey);
  const certificates = certificatesResource.data.map(normalizeCertificate);
  const summary = summaryResource.data;
  const isDbConnected = healthResource.data?.database_connected !== false;
  const isAuthError =
    certificatesResource.errorDetail?.includes("admin_required") ||
    summaryResource.errorDetail?.includes("admin_required") ||
    certificatesResource.errorDetail?.includes("403") ||
    summaryResource.errorDetail?.includes("403");
  const showDbWarning = !healthResource.loading && healthResource.data?.database_connected === false;
  const [showCreateForm, setShowCreateForm] = useState(true);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Operacion"
          title="Panel institucional"
          description="Resumen operativo para seguimiento de emision, revision, publicacion y control de riesgos."
        />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className={showCreateForm ? "secondary-button text-xs py-2" : "primary-button text-xs py-2"}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Plegar formulario
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Registrar certificado
              </>
            )}
          </button>
          <button className="secondary-button text-xs py-2" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {isAuthError && (
        <Notice tone="danger">
          Tu navegador tiene guardado un token de sesión anterior. Pulsa <strong>Cerrar sesión</strong> (arriba a la derecha) e ingresa nuevamente con tu clave actual.
        </Notice>
      )}
      {!isAuthError && showDbWarning && (
        <Notice tone="warning">
          La base de datos PostgreSQL no está conectada. Se muestran datos de demostración mientras configuras la variable DATABASE_URL en Railway.
        </Notice>
      )}
      {!isAuthError && !showDbWarning && (certificatesResource.usingFallback || summaryResource.usingFallback) && (
        <Notice tone="warning">
          No se pudieron sincronizar algunos datos en tiempo real. Se muestran datos de respaldo temporales.
        </Notice>
      )}
      <WorkflowGuide />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileCheck2} label="Publicados" value={summary.published} helper="Registro oficial" />
        <StatCard icon={ClipboardCheck} label="En revision" value={summary.in_review} helper="Incluye observados" tone="text-signal" />
        <StatCard icon={BadgeCheck} label="Politicas activas" value={summary.active_policies} helper="Versionadas y auditadas" tone="text-sky-700" />
        <StatCard icon={AlertTriangle} label="Revocados" value={summary.revoked} helper="Todos con motivo registrado" tone="text-danger" />
      </div>

      {/* Barra horizontal de Salud del Servicio e Infraestructura */}
      <div className="panel flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Activity className="h-4 w-4 text-civic" />
          <span>Salud del servicio:</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-slate-500">API Pública:</span>
            <span className="font-semibold text-emerald-700">Activa</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                isDbConnected ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="text-slate-500">PostgreSQL:</span>
            <span className={`font-semibold ${isDbConnected ? "text-emerald-700" : "text-danger"}`}>
              {isDbConnected ? "Conectado" : "Desconectado (Revisar DATABASE_URL)"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Backups:</span>
            <span className="font-semibold text-slate-700">Automatizados</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
            <span className="text-slate-500">Seguridad:</span>
            <span className="font-semibold text-slate-700">TLS 1.3 / Encriptado</span>
          </div>
        </div>
      </div>

      {/* Formulario de Registro Guiado - Amplio y Armónico en 2 Columnas */}
      {showCreateForm ? (
        <QuickCreateSection
          catalog={catalogResource.data}
          certificates={certificates}
          onSaved={onRefresh}
          onClose={() => setShowCreateForm(false)}
        />
      ) : (
        <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-blue-50/40 via-white to-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-civic/10 p-2 text-civic">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">¿Deseas registrar un nuevo certificado institucional?</p>
              <p className="text-xs text-slate-500">
                Abre el formulario guiado para vincular un titular, completar datos académicos y adjuntar documento oficial.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="primary-button shrink-0 text-xs py-2"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-4 w-4" />
            Registrar certificado
          </button>
        </div>
      )}

      {/* Tabla de Certificados Recientes a Pantalla Completa */}
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-base font-semibold text-ink">Certificados recientes</h2>
            <p className="text-sm text-slate-500">Listado general de certificados con paginación y búsqueda en tiempo real.</p>
          </div>
          <div className="flex items-center gap-2">
            {!showCreateForm && (
              <button
                type="button"
                className="secondary-button text-xs py-1.5"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Nuevo certificado
              </button>
            )}
            <button className="secondary-button text-xs py-1.5" onClick={onRefresh}>
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar lista
            </button>
          </div>
        </div>
        <ResponsiveTable certificates={certificates} onRefresh={onRefresh} catalog={catalogResource.data} />
      </section>
    </div>
  );
}

function HolderSearchSelector({ holders, selectedHolderId, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedHolder = holders.find((h) => h.id === selectedHolderId);

  const filteredHolders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return holders;
    return holders.filter((h) => {
      const name = (h.name ?? "").toLowerCase();
      const doc = (h.document ?? "").toLowerCase();
      const rawDoc = (h.raw_document ?? "").toLowerCase();
      return name.includes(q) || doc.includes(q) || rawDoc.includes(q);
    });
  }, [holders, query]);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Titular *
        </label>
        {selectedHolder && (
          <button
            type="button"
            className="text-[11px] font-semibold text-civic hover:underline"
            onClick={() => {
              onSelect("");
              setQuery("");
              setOpen(true);
            }}
          >
            Cambiar
          </button>
        )}
      </div>

      {selectedHolder ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink truncate">{selectedHolder.name}</p>
            <p className="font-mono text-slate-500 text-[11px]">{selectedHolder.document}</p>
          </div>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-white transition"
            onClick={() => {
              onSelect("");
              setQuery("");
              setOpen(true);
            }}
            title="Deseleccionar titular"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="field pl-9 pr-8 text-xs bg-white"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
            {query && (
              <button
                type="button"
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                onClick={() => setQuery("")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {open && (
            <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-400">
                <span>{filteredHolders.length} titulares encontrados</span>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setOpen(false)}
                >
                  Cerrar
                </button>
              </div>
              {filteredHolders.length > 0 ? (
                filteredHolders.slice(0, 100).map((holder) => (
                  <button
                    key={holder.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-slate-50 transition"
                    onClick={() => {
                      onSelect(holder.id);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="font-semibold text-ink truncate">{holder.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 shrink-0">
                      {holder.document}
                    </span>
                  </button>
                ))
              ) : (
                <p className="p-3 text-center text-xs text-slate-500">
                  No hay titulares que coincidan con &quot;{query}&quot;.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      <input
        type="text"
        tabIndex={-1}
        className="sr-only"
        required
        value={selectedHolderId}
        onChange={() => {}}
      />
    </div>
  );
}

function CertificateTitleSearchSelector({ titles, selectedTitle, onSelect, onClear }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTitles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return titles;
    return titles.filter((item) => {
      const title = (item.title ?? "").toLowerCase();
      const program = (item.program ?? "").toLowerCase();
      return title.includes(q) || program.includes(q);
    });
  }, [titles, query]);

  const hasExactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return titles.some((item) => (item.title ?? "").trim().toLowerCase() === q);
  }, [titles, query]);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      {selectedTitle ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2 text-xs">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink truncate">{selectedTitle}</p>
            <p className="font-mono text-slate-500 text-[11px]">Título registrado seleccionado</p>
          </div>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-white transition"
            onClick={() => {
              onClear();
              setQuery("");
              setOpen(true);
            }}
            title="Deseleccionar título"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="field pl-9 pr-8 text-xs bg-white"
              placeholder="Buscar título registrado (ej. Diplomado, Curso, Certificado)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  e.preventDefault();
                  onSelect({ title: query.trim() });
                  setOpen(false);
                  setQuery("");
                }
              }}
            />
            {query && (
              <button
                type="button"
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                onClick={() => setQuery("")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {open && (
            <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-400">
                <span>{filteredTitles.length} títulos encontrados</span>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => setOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              {filteredTitles.length > 0 ? (
                filteredTitles.slice(0, 100).map((item, idx) => (
                  <button
                    key={`${item.title}-${idx}`}
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-slate-50 transition"
                    onClick={() => {
                      onSelect(item);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="font-semibold text-ink truncate">{item.title}</span>
                    {item.program && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-[11px] text-slate-600 shrink-0 max-w-[160px] truncate">
                        {item.program}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <p className="p-3 text-center text-xs text-slate-500">
                  No hay títulos registrados que coincidan con &quot;{query}&quot;.
                </p>
              )}

              {query.trim() && !hasExactMatch && (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 border-t border-slate-100 px-2.5 py-2 text-left text-xs font-semibold text-civic hover:bg-blue-50/60 transition"
                  onClick={() => {
                    onSelect({ title: query.trim() });
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Usar &quot;{query.trim()}&quot; como nuevo título</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
      <input
        type="text"
        tabIndex={-1}
        className="sr-only"
        required
        value={selectedTitle}
        onChange={() => {}}
      />
    </div>
  );
}

function QuickCreateSection({ catalog, certificates = [], onSaved, onClose }) {
  const [holderMode, setHolderMode] = useState("search"); // "search" | "create"
  const [titleMode, setTitleMode] = useState("search"); // "search" | "manual"
  const [holderForm, setHolderForm] = useState({
    tipo_documento: "DNI",
    documento: "",
    nombres: "",
    apellidos: "",
  });
  const [certificateForm, setCertificateForm] = useState({
    holder_id: "",
    type_id: "",
    numero_institucional: `SICV-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`,
    titulo: "",
    programa: "",
    fecha_emision: new Date().toISOString().slice(0, 10),
    vence_en: "",
    origen: "NUEVO",
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [recentlyCreatedHolders, setRecentlyCreatedHolders] = useState([]);
  const [recentlyUsedTitles, setRecentlyUsedTitles] = useState([]);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [busy, setBusy] = useState(false);

  const allHolders = useMemo(() => {
    const map = new Map();
    recentlyCreatedHolders.forEach((h) => map.set(h.id, h));
    (catalog?.holders ?? []).forEach((h) => map.set(h.id, h));
    return Array.from(map.values());
  }, [catalog?.holders, recentlyCreatedHolders]);

  const allTitles = useMemo(() => {
    const map = new Map();

    const addTitle = (rawTitle, program = "", typeId = "") => {
      const trimmed = (rawTitle || "").trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          title: trimmed,
          program: (program || "").trim(),
          typeId: typeId || "",
        });
      }
    };

    // 1. Recientemente usados en la sesión
    recentlyUsedTitles.forEach((t) => addTitle(t.title, t.program, t.typeId));

    // 2. De certificados existentes en el sistema
    (certificates ?? []).forEach((c) => addTitle(c.title, c.program, c.typeId));

    // 3. Del catálogo
    (catalog?.titles ?? []).forEach((item) => {
      if (typeof item === "string") {
        addTitle(item);
      } else if (item && item.title) {
        addTitle(item.title, item.program, item.type_id || item.typeId);
      }
    });

    // 4. Ejemplos institucionales predeterminados
    const defaults = [
      { title: "Diplomado en Gestión Pública y Transformación Digital", program: "Programa de Especialización Continua 2026" },
      { title: "Certificado de Capacitación", program: "Gestión Administrativa" },
      { title: "Certificado Técnico de Especialización", program: "Soporte Informático" },
      { title: "Constancia de Participación", program: "Educación Continua" },
      { title: "Constancia Histórica de Estudios", program: "Formación Profesional" },
    ];
    defaults.forEach((d) => addTitle(d.title, d.program));

    return Array.from(map.values());
  }, [catalog?.titles, certificates, recentlyUsedTitles]);

  const types = catalog?.types ?? [];

  async function createHolder(event) {
    if (event) event.preventDefault();
    if (!holderForm.documento.trim() || !holderForm.nombres.trim() || !holderForm.apellidos.trim()) {
      setMessage("Por favor completa el tipo, número de documento, nombres y apellidos del titular.");
      setMessageTone("error");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const holder = await apiRequest("/admin/holders", {
        method: "POST",
        body: JSON.stringify(holderForm),
      });
      setRecentlyCreatedHolders((prev) => [holder, ...prev]);
      setCertificateForm((current) => ({ ...current, holder_id: holder.id }));
      setHolderForm({ tipo_documento: "DNI", documento: "", nombres: "", apellidos: "" });
      setHolderMode("search");
      setMessage(`Titular "${holder.name || `${holderForm.nombres} ${holderForm.apellidos}`}" creado y vinculado exitosamente.`);
      setMessageTone("success");
      onSaved();
    } catch (error) {
      setMessage(`No se pudo crear titular: ${error.message}`);
      setMessageTone("error");
    } finally {
      setBusy(false);
    }
  }

  async function createCertificate(event) {
    if (event) event.preventDefault();
    if (!certificateForm.holder_id) {
      setMessage("Debes seleccionar o registrar un titular en el Paso 1 antes de crear el certificado.");
      setMessageTone("error");
      return;
    }
    if (!certificateForm.type_id) {
      setMessage("Debes seleccionar el tipo de certificado en el Paso 2.");
      setMessageTone("error");
      return;
    }
    if (!certificateForm.titulo.trim()) {
      setMessage("Debes ingresar el título del certificado.");
      setMessageTone("error");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const certificate = await apiRequest("/admin/certificates", {
        method: "POST",
        body: JSON.stringify({
          ...certificateForm,
          vence_en: certificateForm.vence_en || null,
        }),
      });
      if (certificateFile) {
        const formData = new FormData();
        formData.append("file", certificateFile);
        await apiRequest(`/admin/certificates/${certificate.id}/documents`, {
          method: "POST",
          body: formData,
        });
      }
      const savedTitle = certificateForm.titulo.trim();
      const savedProgram = certificateForm.programa.trim();
      const savedTypeId = certificateForm.type_id;

      if (savedTitle) {
        setRecentlyUsedTitles((prev) => [
          {
            title: savedTitle,
            program: savedProgram,
            typeId: savedTypeId,
          },
          ...prev,
        ]);
      }

      setCertificateForm((current) => ({
        ...current,
        numero_institucional: `SICV-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`,
        titulo: "",
        programa: "",
        vence_en: "",
      }));
      setCertificateFile(null);
      setMessage(
        certificateFile
          ? "¡Certificado registrado con éxito con documento adjunto y QR de verificación! Puedes revisarlo en la lista."
          : "¡Certificado registrado con éxito con QR de verificación! Puedes adjuntar el documento en cualquier momento.",
      );
      setMessageTone("success");
      onSaved();
    } catch (error) {
      setMessage(`No se pudo crear certificado: ${error.message}`);
      setMessageTone("error");
    } finally {
      setBusy(false);
    }
  }

  const selectedHolder = allHolders.find((h) => h.id === certificateForm.holder_id);

  return (
    <section className="panel overflow-hidden border border-slate-200/90 shadow-sm">
      {/* Encabezado del Formulario */}
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-civic/10 p-2.5 text-civic">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Registro guiado de certificados</h2>
            <p className="text-xs text-slate-500">
              Asigna o crea el titular, completa los datos académicos y adjunta el documento oficial.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-ink transition"
              onClick={onClose}
            >
              <ChevronUp className="h-4 w-4" />
              Plegar formulario
            </button>
          )}
        </div>
      </div>

      {/* Disposición amplia de 2 Columnas */}
      <div className="p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Columna 1: Paso 1 - Titular (5 columnas) */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 sm:p-5 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-civic text-xs font-bold text-white">
                    1
                  </span>
                  <h3 className="text-sm font-semibold text-ink">Titular del certificado</h3>
                </div>
                {/* Selector Segmentado */}
                <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                      holderMode === "search" ? "bg-white font-semibold text-ink shadow-sm" : "hover:text-slate-900"
                    }`}
                    onClick={() => setHolderMode("search")}
                  >
                    <Search className="h-3.5 w-3.5" />
                    Buscar
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                      holderMode === "create" ? "bg-white font-semibold text-ink shadow-sm" : "hover:text-slate-900"
                    }`}
                    onClick={() => setHolderMode("create")}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Nuevo
                  </button>
                </div>
              </div>

              <div className="mt-4">
                {holderMode === "search" ? (
                  <div className="space-y-3">
                    <HolderSearchSelector
                      holders={allHolders}
                      selectedHolderId={certificateForm.holder_id}
                      onSelect={(id) => setCertificateForm((c) => ({ ...c, holder_id: id }))}
                    />
                    {selectedHolder && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                        <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                          <CheckCircle2 className="h-4 w-4" />
                          Titular seleccionado correctamente
                        </div>
                        <p className="mt-1 text-slate-600">
                          Los certificados emitidos quedarán vinculados a este expediente personal.
                        </p>
                      </div>
                    )}
                    {!selectedHolder && (
                      <p className="text-xs text-slate-500">
                        Escribe el nombre, apellido o DNI del titular. Si aún no está registrado, pulsa en la pestaña <strong>Nuevo</strong>.
                      </p>
                    )}
                  </div>
                ) : (
                  <form className="space-y-3" onSubmit={createHolder}>
                    <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-2">
                      <div>
                        <label className="text-[11px] font-semibold uppercase text-slate-500" htmlFor="quick-holder-doctype">
                          Tipo doc.
                        </label>
                        <select
                          id="quick-holder-doctype"
                          className="field mt-1 text-xs"
                          value={holderForm.tipo_documento}
                          onChange={(e) => setHolderForm({ ...holderForm, tipo_documento: e.target.value })}
                        >
                          <option>DNI</option>
                          <option>CE</option>
                          <option>PAS</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold uppercase text-slate-500" htmlFor="quick-holder-docnum">
                          Número de documento *
                        </label>
                        <input
                          id="quick-holder-docnum"
                          className="field mt-1 text-xs"
                          placeholder="Ej. 71234567"
                          value={holderForm.documento}
                          onChange={(e) => setHolderForm({ ...holderForm, documento: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-slate-500" htmlFor="quick-holder-names">
                        Nombres *
                      </label>
                      <input
                        id="quick-holder-names"
                        className="field mt-1 text-xs"
                        placeholder="Nombres completos"
                        value={holderForm.nombres}
                        onChange={(e) => setHolderForm({ ...holderForm, nombres: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase text-slate-500" htmlFor="quick-holder-surnames">
                        Apellidos *
                      </label>
                      <input
                        id="quick-holder-surnames"
                        className="field mt-1 text-xs"
                        placeholder="Apellidos completos"
                        value={holderForm.apellidos}
                        onChange={(e) => setHolderForm({ ...holderForm, apellidos: e.target.value })}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={busy}
                      className="secondary-button w-full text-xs py-2"
                    >
                      <UserRoundCheck className="h-4 w-4" />
                      {busy ? "Guardando..." : "Guardar y vincular titular"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200/80 pt-3 text-[11px] text-slate-400">
              Paso 1 requerido antes de crear el certificado oficial.
            </div>
          </div>

          {/* Columna 2: Paso 2 - Certificado y Documento (7 columnas) */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/40 p-4 sm:p-5 lg:col-span-7">
            <div>
              <div className="border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-civic text-xs font-bold text-white">
                    2
                  </span>
                  <h3 className="text-sm font-semibold text-ink">Datos del certificado y archivo</h3>
                </div>
              </div>

              <div className="mt-4 space-y-3.5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="quick-cert-type">
                      Tipo de certificado *
                    </label>
                    <select
                      id="quick-cert-type"
                      className="field mt-1 text-xs"
                      value={certificateForm.type_id}
                      onChange={(e) => setCertificateForm({ ...certificateForm, type_id: e.target.value })}
                      required
                    >
                      <option value="">Selecciona tipo...</option>
                      {types.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="quick-cert-number">
                      Código institucional *
                    </label>
                    <input
                      id="quick-cert-number"
                      className="field mt-1 font-mono text-xs"
                      value={certificateForm.numero_institucional}
                      onChange={(e) =>
                        setCertificateForm({ ...certificateForm, numero_institucional: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="quick-cert-title">
                      Título del certificado *
                    </label>
                    <div className="flex items-center gap-2">
                      {certificateForm.titulo && titleMode === "search" && (
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-civic hover:underline"
                          onClick={() => {
                            setCertificateForm((current) => ({ ...current, titulo: "" }));
                          }}
                        >
                          Cambiar
                        </button>
                      )}
                      <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-medium text-slate-600">
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                            titleMode === "search" ? "bg-white font-semibold text-ink shadow-sm" : "hover:text-slate-900"
                          }`}
                          onClick={() => setTitleMode("search")}
                        >
                          <Search className="h-3.5 w-3.5" />
                          Buscar
                        </button>
                        <button
                          type="button"
                          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${
                            titleMode === "manual" ? "bg-white font-semibold text-ink shadow-sm" : "hover:text-slate-900"
                          }`}
                          onClick={() => setTitleMode("manual")}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Nuevo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1.5">
                    {titleMode === "search" ? (
                      <CertificateTitleSearchSelector
                        titles={allTitles}
                        selectedTitle={certificateForm.titulo}
                        onSelect={(item) => {
                          setCertificateForm((current) => ({
                            ...current,
                            titulo: item.title,
                            programa: current.programa || item.program || "",
                            type_id: current.type_id || item.typeId || current.type_id,
                          }));
                        }}
                        onClear={() => {
                          setCertificateForm((current) => ({ ...current, titulo: "" }));
                        }}
                      />
                    ) : (
                      <input
                        id="quick-cert-title"
                        className="field text-xs bg-white"
                        value={certificateForm.titulo}
                        onChange={(e) => setCertificateForm({ ...certificateForm, titulo: e.target.value })}
                        placeholder="Ej. Diplomado en Gestión Pública y Transformación Digital"
                        required
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="quick-cert-program">
                    Programa o especialidad
                  </label>
                  <input
                    id="quick-cert-program"
                    className="field mt-1 text-xs"
                    value={certificateForm.programa}
                    onChange={(e) => setCertificateForm({ ...certificateForm, programa: e.target.value })}
                    placeholder="Ej. Programa de Especialización Continua 2026"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="quick-cert-date">
                      Fecha de emisión *
                    </label>
                    <input
                      id="quick-cert-date"
                      type="date"
                      className="field mt-1 text-xs"
                      value={certificateForm.fecha_emision}
                      onChange={(e) => setCertificateForm({ ...certificateForm, fecha_emision: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="quick-cert-origin">
                      Origen del registro
                    </label>
                    <select
                      id="quick-cert-origin"
                      className="field mt-1 text-xs"
                      value={certificateForm.origen}
                      onChange={(e) => setCertificateForm({ ...certificateForm, origen: e.target.value })}
                    >
                      <option value="NUEVO">Nuevo (Emisión digital nativa)</option>
                      <option value="HISTORICO">Histórico (Digitalización de archivo)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Documento de respaldo (opcional)
                  </label>
                  <label className="mt-1 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-600 transition hover:border-civic hover:bg-blue-50/40">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Upload className="h-4 w-4 shrink-0 text-civic" />
                      <span className="font-medium text-slate-700 truncate">
                        {certificateFile ? certificateFile.name : "Subir PDF o imagen del certificado (hasta 10 MB)"}
                      </span>
                    </div>
                    {certificateFile ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setCertificateFile(null);
                        }}
                        className="text-xs font-semibold text-rose-600 hover:underline shrink-0"
                      >
                        Quitar
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">Examinar...</span>
                    )}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      onChange={(e) => setCertificateFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200/80 pt-3 text-[11px] text-slate-400">
              Genera folio seguro y token QR criptográfico de verificación pública.
            </div>
          </div>
        </div>

        {/* Barra de pie con mensajes de estado y acción */}
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            {message && (
              <p
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  messageTone === "error"
                    ? "border border-rose-200 bg-rose-50 text-rose-700"
                    : messageTone === "success"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {message}
              </p>
            )}
            {!message && (
              <p className="text-xs text-slate-500">
                Al crear el certificado, se registrará como borrador con su código institucional y token QR oficial.
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onClose && (
              <button
                type="button"
                className="secondary-button text-xs py-2"
                onClick={onClose}
                disabled={busy}
              >
                Cerrar
              </button>
            )}
            <button
              type="button"
              className="primary-button text-xs py-2"
              disabled={busy}
              onClick={createCertificate}
            >
              <FileCheck2 className="h-4 w-4" />
              {busy ? "Registrando..." : "Crear borrador de certificado"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickCreatePanel(props) {
  return <QuickCreateSection {...props} />;
}

function EditCertificateModal({ certificate, catalog, onClose, onSaved }) {
  const [form, setForm] = useState({
    nombres: certificate.holderNames || certificate.holder?.split(" ")?.[0] || "",
    apellidos: certificate.holderSurnames || certificate.holder?.split(" ")?.slice(1).join(" ") || "",
    tipo_documento: certificate.holderDocType || "DNI",
    documento: certificate.holderDocNumber || (certificate.maskedDocument ? certificate.maskedDocument.replace(/^[^\d]*/, "") : ""),
    numero_institucional: certificate.code ?? certificate.token ?? "",
    titulo: certificate.title ?? "",
    programa: certificate.program ?? "",
    type_id: certificate.typeId ?? "",
    fecha_emision: certificate.issuedOn ?? new Date().toISOString().slice(0, 10),
    vence_en: certificate.expiresOn ?? "",
    reason: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const types = catalog?.types ?? [];

  async function handleSubmit(event) {
    event.preventDefault();
    if (!certificate.id) {
      setError("No se puede editar una fila de demostración local.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/admin/certificates/${certificate.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          tipo_documento: form.tipo_documento.trim().toUpperCase(),
          documento: form.documento.trim(),
          numero_institucional: form.numero_institucional.trim(),
          titulo: form.titulo.trim(),
          programa: form.programa.trim() || null,
          type_id: form.type_id || null,
          fecha_emision: form.fecha_emision,
          vence_en: form.vence_en || null,
          reason: form.reason.trim() || null,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(`No se pudo actualizar: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-3 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="panel flex flex-col max-h-[94vh] w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-civic">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Editar certificado</h2>
              <p className="text-xs text-slate-500">
                Corrige errores en nombres, documento, título, código o fechas. Se guardará registro de auditoría.
              </p>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar edicion">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Datos del Participante (Titular)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombres *</label>
                <input
                  type="text"
                  className="field"
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Apellidos *</label>
                <input
                  type="text"
                  className="field"
                  value={form.apellidos}
                  onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Documento *</label>
                <select
                  className="field"
                  value={form.tipo_documento}
                  onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}
                  required
                >
                  <option value="DNI">DNI - Documento Nacional</option>
                  <option value="CE">CE - Carnet de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Número de Documento *</label>
                <input
                  type="text"
                  className="field"
                  value={form.documento}
                  onChange={(e) => setForm({ ...form, documento: e.target.value })}
                  placeholder="ej. 72345678"
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Datos del Certificado</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Código Institucional / Folio *</label>
                <input
                  type="text"
                  className="field font-mono font-semibold"
                  value={form.numero_institucional}
                  onChange={(e) => setForm({ ...form, numero_institucional: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Certificado</label>
                <select
                  className="field"
                  value={form.type_id}
                  onChange={(e) => setForm({ ...form, type_id: e.target.value })}
                >
                  <option value="">(Mantener actual / Ninguno)</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.codigo} - {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Título del Certificado *</label>
              <input
                type="text"
                className="field"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="ej. Certificado de Capacitación"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Programa / Curso / Especialidad</label>
              <input
                type="text"
                className="field"
                value={form.programa}
                onChange={(e) => setForm({ ...form, programa: e.target.value })}
                placeholder="ej. Gestión Administrativa y Tributaria"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de Emisión *</label>
                <input
                  type="date"
                  className="field"
                  value={form.fecha_emision}
                  onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de Vencimiento (opcional)</label>
                <input
                  type="date"
                  className="field"
                  value={form.vence_en}
                  onChange={(e) => setForm({ ...form, vence_en: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Motivo o Justificación de la Modificación (para Auditoría)
            </label>
            <input
              type="text"
              className="field"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="ej. Corrección de error tipográfico en apellidos"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 p-4">
          <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" disabled={busy}>
            <Save className="h-4 w-4" />
            {busy ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteConfirmModal({ certificate, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!certificate.id) {
      setError("No se puede eliminar una fila de demostración local.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/admin/certificates/${certificate.id}`, {
        method: "DELETE",
      });
      onDeleted();
      onClose();
    } catch (err) {
      setError(`No se pudo eliminar: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4">
      <div className="panel w-full max-w-md p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-red-50 p-2.5 text-danger shrink-0">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">¿Eliminar certificado?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Esta acción no se puede deshacer. Se eliminará el registro oficial, el código QR y los archivos adjuntos.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm space-y-1">
          <p className="font-mono font-semibold text-civic">{certificate.code ?? certificate.token}</p>
          <p className="font-semibold text-ink">{certificate.holder}</p>
          <p className="text-xs text-slate-500">{certificate.title}</p>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            onClick={handleDelete}
            disabled={busy}
          >
            <Trash2 className="h-4 w-4" />
            {busy ? "Eliminando..." : "Sí, eliminar definitivamente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResponsiveTable({ certificates, onRefresh, catalog }) {
  const [message, setMessage] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [deletingCertificate, setDeletingCertificate] = useState(null);
  const [revocationTarget, setRevocationTarget] = useState(null);

  // Pagination & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Real-time filter
  const filteredCertificates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return certificates;
    return certificates.filter((c) => {
      const code = (c.code ?? c.token ?? "").toLowerCase();
      const holder = (c.holder ?? "").toLowerCase();
      const title = (c.title ?? "").toLowerCase();
      const program = (c.program ?? "").toLowerCase();
      const status = (c.status ?? "").toLowerCase();
      const doc = (c.maskedDocument ?? "").toLowerCase();
      return (
        code.includes(q) ||
        holder.includes(q) ||
        title.includes(q) ||
        program.includes(q) ||
        status.includes(q) ||
        doc.includes(q)
      );
    });
  }, [certificates, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / pageSize));

  // Reset page when out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCertificates = filteredCertificates.slice(startIndex, endIndex);

  async function revoke(certificate, reason) {
    if (!certificate.id) {
      setMessage("No se puede revocar una fila local de respaldo.");
      return;
    }
    try {
      await apiRequest(`/admin/certificates/${certificate.id}/revoke`, {
        method: "POST",
        body: JSON.stringify({
          actor: "Autoridad SICV",
          reason,
        }),
      });
      setMessage("Certificado revocado. La verificación pública reflejará el nuevo estado.");
      onRefresh();
    } catch (error) {
      setMessage(`No se pudo revocar: ${error.message}`);
    }
  }

  return (
    <>
      {message && <p className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</p>}
      
      {/* Barra de Filtro en Tiempo Real y Selector de Registros */}
      <div className="flex flex-col gap-2.5 border-b border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="field pl-9 pr-8 text-xs bg-white"
            placeholder="Buscar por código, titular, curso o estado..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              title="Limpiar filtro"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 justify-between sm:justify-end">
          <span>Mostrar:</span>
          <select
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-2xs"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 por pág.</option>
            <option value={10}>10 por pág.</option>
            <option value={20}>20 por pág.</option>
            <option value={50}>50 por pág.</option>
          </select>
          <span className="font-semibold text-slate-700 whitespace-nowrap">
            {filteredCertificates.length} {filteredCertificates.length === 1 ? "registro" : "registros"}
          </span>
        </div>
      </div>

      {/* Vista de Tabla para Pantallas Medianas y Grandes (Tablet / Desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="w-[135px] px-3.5 py-3 font-semibold">Código</th>
              <th className="w-[160px] px-3.5 py-3 font-semibold">Titular</th>
              <th className="px-3.5 py-3 font-semibold">Certificado</th>
              <th className="w-[105px] px-3 py-3 font-semibold">Estado</th>
              <th className="w-[85px] px-3 py-3 font-semibold">Fecha</th>
              <th className="w-[185px] px-3 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentCertificates.length > 0 ? (
              currentCertificates.map((certificate) => (
                <tr key={certificate.id ?? certificate.token} className="hover:bg-slate-50/80 transition">
                  <td className="px-3.5 py-2.5 font-mono text-xs font-semibold text-civic truncate" title={certificate.code ?? certificate.token}>
                    {certificate.code ?? certificate.token}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-800 font-medium truncate" title={certificate.holder}>
                    {certificate.holder}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-600 truncate" title={certificate.title}>
                    <p className="truncate font-normal">{certificate.title}</p>
                    {certificate.program && (
                      <p className="truncate text-[11px] text-slate-400">{certificate.program}</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <StatusBadge value={certificate.status} />
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {certificate.issuedOn}
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:border-civic hover:bg-blue-50 hover:text-civic transition"
                        title="Ver expediente completo"
                        onClick={() => setSelectedCertificate(certificate)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:border-civic hover:bg-blue-50 hover:text-civic transition"
                        title="Editar datos del certificado"
                        onClick={() => setEditingCertificate(certificate)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {certificate.status === "PUBLICADO" && (
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50/70 text-amber-700 shadow-2xs hover:bg-amber-100 transition"
                          title="Revocar certificado"
                          onClick={() => setRevocationTarget(certificate)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50/70 text-danger shadow-2xs hover:bg-red-100 transition"
                        title="Eliminar certificado"
                        onClick={() => setDeletingCertificate(certificate)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  {searchTerm ? `No se encontraron certificados para "${searchTerm}".` : "No hay certificados registrados."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas Optimizada para Móviles (Smartphones) */}
      <div className="divide-y divide-slate-100 md:hidden bg-white">
        {currentCertificates.length > 0 ? (
          currentCertificates.map((certificate) => (
            <div key={certificate.id ?? certificate.token} className="p-4 space-y-3 hover:bg-slate-50/60 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs font-bold text-civic block truncate">{certificate.code ?? certificate.token}</span>
                  <h3 className="font-semibold text-ink text-sm mt-0.5 truncate">{certificate.holder}</h3>
                  <p className="text-xs text-slate-500 truncate">{certificate.title}</p>
                </div>
                <StatusBadge value={certificate.status} />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-xs text-slate-500">
                <span>{certificate.issuedOn}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50"
                    title="Ver expediente"
                    onClick={() => setSelectedCertificate(certificate)}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50"
                    title="Editar datos"
                    onClick={() => setEditingCertificate(certificate)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {certificate.status === "PUBLICADO" && (
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 shadow-2xs hover:bg-amber-100"
                      title="Revocar"
                      onClick={() => setRevocationTarget(certificate)}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-danger shadow-2xs hover:bg-red-100"
                    title="Eliminar"
                    onClick={() => setDeletingCertificate(certificate)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-sm text-slate-500">
            {searchTerm ? `No se encontraron certificados para "${searchTerm}".` : "No hay certificados registrados."}
          </div>
        )}
      </div>

      {/* Controles de Paginación */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 px-4 py-3 bg-slate-50/70 text-xs">
        <p className="text-slate-500">
          Mostrando <span className="font-semibold text-ink">{filteredCertificates.length > 0 ? startIndex + 1 : 0}</span> a{" "}
          <span className="font-semibold text-ink">{Math.min(endIndex, filteredCertificates.length)}</span> de{" "}
          <span className="font-semibold text-ink">{filteredCertificates.length}</span> registros
        </p>

        {totalPages > 1 && (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className="secondary-button min-h-8 px-2 py-1 text-xs disabled:opacity-40"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(1)}
              title="Primera página"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="secondary-button min-h-8 px-2.5 py-1 text-xs disabled:opacity-40"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
              Anterior
            </button>

            <span className="px-2.5 py-1 font-semibold text-slate-700 bg-white rounded-md border border-slate-200">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              className="secondary-button min-h-8 px-2.5 py-1 text-xs disabled:opacity-40"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
            <button
              type="button"
              className="secondary-button min-h-8 px-2 py-1 text-xs disabled:opacity-40"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title="Última página"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onRefresh={onRefresh}
          onEdit={(cert) => {
            setSelectedCertificate(null);
            setEditingCertificate(cert);
          }}
          onDelete={(cert) => {
            setSelectedCertificate(null);
            setDeletingCertificate(cert);
          }}
        />
      )}
      {editingCertificate && (
        <EditCertificateModal
          certificate={editingCertificate}
          catalog={catalog}
          onClose={() => setEditingCertificate(null)}
          onSaved={() => {
            setMessage("Certificado actualizado correctamente.");
            onRefresh();
          }}
        />
      )}
      {deletingCertificate && (
        <DeleteConfirmModal
          certificate={deletingCertificate}
          onClose={() => setDeletingCertificate(null)}
          onDeleted={() => {
            setMessage("Certificado eliminado correctamente.");
            onRefresh();
          }}
        />
      )}
      {revocationTarget && (
        <RevocationModal
          certificate={revocationTarget}
          onCancel={() => setRevocationTarget(null)}
          onConfirm={async (reason) => {
            await revoke(revocationTarget, reason);
            setRevocationTarget(null);
          }}
        />
      )}
    </>
  );
}

function RevocationModal({ certificate, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!reason.trim()) return;
    setBusy(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4">
      <form className="panel w-full max-w-lg p-5" onSubmit={submit}>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-red-50 p-2 text-danger">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Confirmar revocacion</h2>
            <p className="mt-1 text-sm text-slate-600">
              Esta accion hara que el certificado deje de mostrarse como valido en la verificacion publica.
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-ink">{certificate.code ?? certificate.token}</p>
          <p className="text-slate-600">{certificate.holder}</p>
          <p className="text-slate-600">{certificate.title}</p>
        </div>
        <label className="mt-4 block text-xs font-semibold uppercase text-slate-500" htmlFor="revocation-reason">
          Motivo de revocacion
        </label>
        <textarea
          id="revocation-reason"
          className="field mt-2 min-h-28 py-3"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Describe el motivo que quedara registrado en auditoria"
          required
        />
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="primary-button bg-danger hover:bg-red-800" type="submit" disabled={busy || !reason.trim()}>
            Revocar certificado
          </button>
        </div>
      </form>
    </div>
  );
}

function CertificateModal({ certificate, onClose, onRefresh, onEdit, onDelete }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [documentAvailable, setDocumentAvailable] = useState(Boolean(certificate.hasDocument));
  const [resourceRefresh, setResourceRefresh] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const documentPath = certificate.id ? `/admin/certificates/${certificate.id}/document` : "";
  const qrPath = certificate.id ? `/admin/certificates/${certificate.id}/qr` : "";
  const documentBlob = useProtectedBlob(documentPath, Boolean(certificate.id && documentAvailable), resourceRefresh);
  const qrBlob = useProtectedBlob(qrPath, Boolean(certificate.id), resourceRefresh);

  useEffect(() => {
    setDocumentAvailable(Boolean(certificate.hasDocument));
    setResourceRefresh((current) => current + 1);
  }, [certificate.id, certificate.hasDocument]);

  async function uploadDocument(event) {
    const file = event.target.files?.[0];
    if (!file || !certificate.id) return;
    setBusy(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiRequest(`/admin/certificates/${certificate.id}/documents`, {
        method: "POST",
        body: formData,
      });
      setDocumentAvailable(true);
      setResourceRefresh((current) => current + 1);
      setMessage("Documento cargado y resguardado en la base de datos.");
      onRefresh();
    } catch (error) {
      setMessage(`No se pudo cargar documento: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  const verificationUrl =
    certificate.qrUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/v/${encodeURIComponent(certificate.token || certificate.code)}`
      : `/v/${encodeURIComponent(certificate.token || certificate.code)}`);

  async function copyVerificationUrl() {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setMessage("No se pudo copiar el enlace.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-3 sm:p-4 md:p-6 overflow-y-auto">
      <section className="panel flex flex-col my-auto max-h-[92vh] w-full max-w-5xl overflow-hidden shadow-2xl border border-slate-200">
        {/* Cabecera Principal */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={certificate.status} />
              <span className="font-mono text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {certificate.code ?? certificate.token}
              </span>
              <span className="text-xs text-slate-500">
                • {certificate.origin === "NUEVO" ? "Emisión digital" : "Digitalización histórica"}
              </span>
            </div>
            <h2 className="mt-1.5 text-lg sm:text-xl font-bold text-ink truncate">
              {certificate.title}
            </h2>
            <p className="text-xs text-slate-500">
              Expediente digital oficial emitido por {certificate.issuer || "la institución"}.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="secondary-button text-xs py-1.5"
              onClick={() => onEdit?.(certificate)}
              title="Editar datos del certificado"
            >
              <Pencil className="h-3.5 w-3.5 text-civic" />
              Editar
            </button>
            <button
              type="button"
              className="secondary-button text-xs py-1.5 text-danger hover:border-red-300 hover:bg-red-50"
              onClick={() => onDelete?.(certificate)}
              title="Eliminar este certificado"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </button>
            <button
              type="button"
              className="icon-button h-8 w-8 ml-1"
              onClick={onClose}
              aria-label="Cerrar expediente"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Ficha Resumen Horizontal Superior */}
        <div className="grid grid-cols-2 gap-3 border-b border-slate-200 bg-white p-4 sm:grid-cols-4 sm:px-6 text-xs">
          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-slate-400 text-[10px]">Titular</span>
            <p className="font-semibold text-slate-800 text-sm truncate">{certificate.holder || "No registrado"}</p>
            <p className="font-mono text-slate-500 text-[11px]">{certificate.maskedDocument ?? "DNI no público"}</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-slate-400 text-[10px]">Programa / Especialidad</span>
            <p className="font-semibold text-slate-800 text-sm truncate">{certificate.program || "General"}</p>
            <p className="text-slate-500 text-[11px]">Especialidad académica</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-slate-400 text-[10px]">Emisión y Vigencia</span>
            <p className="font-semibold text-slate-800 text-sm">{certificate.issuedOn}</p>
            <p className="text-slate-500 text-[11px]">Vence: {certificate.expiresOn ?? "Permanente"}</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold uppercase tracking-wider text-slate-400 text-[10px]">Divulgación Pública</span>
            <p className="font-semibold text-slate-800 text-sm truncate">
              {certificate.documentPublic ? "Vista previa habilitada" : "Vista previa restringida"}
            </p>
            <p className="text-slate-500 text-[11px] truncate">
              {certificate.disclosure || "Política institucional"}
            </p>
          </div>
        </div>

        {/* Cuerpo del Modal: 2 Columnas Balanceadas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Columna Izquierda (7 cols): Documento Oficial con Visor */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white shadow-xs lg:col-span-7 overflow-hidden">
              <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-civic" />
                    Documento de respaldo
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {documentAvailable ? "Evidencia digital vinculada al expediente." : "No se ha adjuntado archivo aún."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="secondary-button text-xs py-1.5 cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-civic" />
                    {busy ? "Cargando..." : documentAvailable ? "Reemplazar documento" : "Subir documento"}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      onChange={uploadDocument}
                    />
                  </label>
                  {documentAvailable && documentBlob.blobUrl && (
                    <button
                      type="button"
                      className="secondary-button text-xs py-1.5"
                      onClick={() =>
                        downloadProtectedFile(
                          documentPath,
                          `documento-${certificate.code ?? certificate.token}.pdf`
                        )
                      }
                      title="Descargar archivo original"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Visor de Documento */}
              <div className="p-3 flex-1 flex flex-col justify-center">
                {documentAvailable ? (
                  documentBlob.blobUrl ? (
                    <div className="rounded-lg overflow-hidden border border-slate-200">
                      <CertificateDocumentPreview
                        blobUrl={documentBlob.blobUrl}
                        contentType={documentBlob.contentType}
                        title="Documento del certificado"
                        alt={`Documento de ${certificate.title}`}
                      />
                    </div>
                  ) : (
                    <div className="grid min-h-[360px] place-items-center p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <div>
                        <Image className="mx-auto h-10 w-10 text-slate-400" />
                        <p className="mt-3 text-sm font-semibold text-ink">
                          {documentBlob.error ? "No se pudo cargar el archivo del documento" : "Cargando documento protegido..."}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 max-w-sm">
                          {documentBlob.error
                            ? "Es posible que el archivo se haya limpiado del almacenamiento temporal tras un redespliegue. Puedes volver a cargarlo usando el botón 'Reemplazar documento'."
                            : "Estamos obteniendo la evidencia digital del certificado."}
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="grid min-h-[360px] place-items-center p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <div className="max-w-sm">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-civic">
                        <Upload className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-ink">Sin documento adjunto</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Carga un archivo PDF o imagen para que este certificado tenga respaldo documental verificable.
                      </p>
                      <label className="primary-button text-xs mt-4 inline-flex cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        Seleccionar archivo (PDF o Imagen)
                        <input
                          className="sr-only"
                          type="file"
                          accept="image/png,image/jpeg,image/webp,application/pdf"
                          onChange={uploadDocument}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha (5 cols): QR Oficial y Verificación */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              {/* Tarjeta QR */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-civic" />
                    <h3 className="text-sm font-semibold text-ink">Código QR de Verificación</h3>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Oficial
                  </span>
                </div>

                <div className="mt-4 flex flex-col items-center">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                    {qrBlob.blobUrl ? (
                      <img className="h-36 w-36 sm:h-40 sm:w-40" src={qrBlob.blobUrl} alt="QR de verificacion" />
                    ) : (
                      <div className="grid h-36 w-36 sm:h-40 sm:w-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs text-slate-500">
                        {qrBlob.error || "Generando QR..."}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="secondary-button text-xs py-1.5 mt-3 w-full"
                    onClick={async () => {
                      try {
                        await downloadProtectedFile(qrPath, `qr-${certificate.code ?? certificate.token}.svg`);
                      } catch (error) {
                        setMessage(`No se pudo descargar QR: ${error.message}`);
                      }
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar QR (SVG)
                  </button>
                </div>

                {/* Enlace y Copia */}
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Enlace público de verificación:</span>
                    <button
                      type="button"
                      onClick={copyVerificationUrl}
                      className="font-semibold text-civic hover:underline flex items-center gap-1"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-700 break-all select-all bg-white p-1.5 rounded border border-slate-200/80">
                    {verificationUrl}
                  </p>
                  <a
                    href={verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-[11px] text-civic hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Probar enlace en portal público
                  </a>
                </div>
              </div>

              {/* Tarjeta de Seguridad y Auditoría */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Políticas y Seguridad
                </h4>
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-civic mt-0.5" />
                  <div>
                    <strong className="text-ink">
                      {certificate.documentPublic ? "Vista previa pública habilitada" : "Vista previa pública restringida"}
                    </strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {certificate.documentPublic
                        ? "Cualquier persona que consulte el código podrá visualizar el documento."
                        : "Solo usuarios autorizados pueden ver el documento digital."}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <KeyRound className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-slate-500 text-[11px]">Token criptográfico:</span>
                    <p className="font-mono text-[11px] text-slate-700 truncate">{certificate.token}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0 flex-1">
            {message && (
              <p className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-medium text-slate-700">
                {message}
              </p>
            )}
          </div>
          <button
            type="button"
            className="secondary-button text-xs py-2 shrink-0"
            onClick={onClose}
          >
            Cerrar expediente
          </button>
        </div>
      </section>
    </div>
  );
}

function BulkImportView({ refreshKey, onRefresh }) {
  const catalogResource = useApiData("/admin/catalog", fallbackCatalog, refreshKey);
  const historyResource = useApiData("/admin/bulk/history", fallbackBulkHistory, refreshKey);
  const types = catalogResource.data.types ?? [];
  const history = historyResource.data ?? [];
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    type_id: "",
    titulo: "Curso de Ofimatica Avanzada",
    programa: "Ofimatica Avanzada",
    fecha_emision: new Date().toISOString().slice(0, 10),
    vence_en: "",
    origen: "NUEVO",
    numero_modo: "AUTOMATICO",
    numero_prefijo: `SICV-${new Date().getFullYear()}-`,
    numero_inicio: 1,
    allow_skip_invalid: false,
    actor: "Administrador SICV",
  });

  function buildBulkFormData() {
    if (!file) throw new Error("Selecciona un archivo Excel o CSV.");
    const data = new FormData();
    data.append("file", file);
    data.append("type_id", form.type_id);
    data.append("titulo", form.titulo);
    data.append("programa", form.programa);
    data.append("fecha_emision", form.fecha_emision);
    if (form.vence_en) data.append("vence_en", form.vence_en);
    data.append("origen", form.origen);
    data.append("numero_modo", form.numero_modo);
    data.append("numero_prefijo", form.numero_prefijo);
    data.append("numero_inicio", String(form.numero_inicio));
    data.append("actor", form.actor);
    data.append("allow_skip_invalid", String(form.allow_skip_invalid));
    return data;
  }

  async function previewFile(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResult(null);
    try {
      const payload = await apiRequest("/admin/bulk/preview", {
        method: "POST",
        body: buildBulkFormData(),
      });
      setPreview(payload);
      setMessage(
        payload.error_rows
          ? `Validacion completada: ${payload.valid_rows} filas validas y ${payload.error_rows} con errores.`
          : `Validacion completada: ${payload.valid_rows} filas listas para importar.`,
      );
    } catch (error) {
      setPreview(null);
      setMessage(`No se pudo validar la carga: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function importFile() {
    setBusy(true);
    setMessage("");
    try {
      const payload = await apiRequest("/admin/bulk/import", {
        method: "POST",
        body: buildBulkFormData(),
      });
      setResult(payload);
      setMessage(`Carga finalizada: ${payload.created} certificados creados y ${payload.skipped} filas omitidas.`);
      onRefresh();
    } catch (error) {
      setMessage(`No se pudo importar: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function submitImportedToReview() {
    if (!result?.bulk_id) return;
    setBusy(true);
    setMessage("");
    try {
      const payload = await apiRequest(`/admin/bulk/${result.bulk_id}/submit`, {
        method: "POST",
        body: JSON.stringify({ actor: form.actor, reason: "Envio masivo desde carga CSV" }),
      });
      setMessage(`${payload.updated} certificados enviados a revision.`);
      onRefresh();
    } catch (error) {
      setMessage(`No se pudo enviar a revision: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  function downloadResult() {
    if (!result?.results?.length) return;
    const header = "fila,numero_institucional,token,url_verificacion\n";
    const lines = result.results.map((item) =>
      [item.row, item.numero_institucional, item.token, item.verification_url]
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(","),
    );
    downloadTextFile(`${header}${lines.join("\n")}\n`, "resultado-carga-masiva-sicv.csv");
  }

  const canImport = preview && preview.valid_rows > 0 && (preview.error_rows === 0 || form.allow_skip_invalid);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administracion"
        title="Carga masiva"
        description="Registra muchos titulares y certificados desde Excel o CSV. El sistema valida antes de guardar y genera un QR seguro por cada certificado creado."
      />

      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form className="panel space-y-4 p-4 sm:p-5" onSubmit={previewFile}>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-civic-light p-2 text-civic">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">Datos comunes</h2>
              <p className="text-sm text-slate-500">Estos datos se aplican a todos los participantes del archivo.</p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <button
              className="secondary-button w-full"
              type="button"
              onClick={() => downloadProtectedFile("/admin/bulk/template.xlsx", "plantilla-carga-masiva-sicv.xlsx")}
            >
              <FileCheck2 className="h-4 w-4" />
              Plantilla Excel
            </button>
            <button
              className="secondary-button w-full"
              type="button"
              onClick={() => downloadProtectedFile("/admin/bulk/template", "plantilla-carga-masiva-sicv.csv")}
            >
              <FileCheck2 className="h-4 w-4" />
              Plantilla CSV
            </button>
          </div>

          <label className="block text-xs font-semibold uppercase text-slate-500" htmlFor="bulk-type">
            Tipo de certificado
          </label>
          <select
            id="bulk-type"
            className="field"
            value={form.type_id}
            onChange={(event) => setForm({ ...form, type_id: event.target.value })}
            required
          >
            <option value="">Seleccionar tipo</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <input
            className="field"
            value={form.titulo}
            onChange={(event) => setForm({ ...form, titulo: event.target.value })}
            placeholder="Titulo del certificado"
            required
          />
          <input
            className="field"
            value={form.programa}
            onChange={(event) => setForm({ ...form, programa: event.target.value })}
            placeholder="Programa o curso"
          />
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <input
              className="field"
              type="date"
              value={form.fecha_emision}
              onChange={(event) => setForm({ ...form, fecha_emision: event.target.value })}
              required
            />
            <input
              className="field"
              type="date"
              value={form.vence_en}
              onChange={(event) => setForm({ ...form, vence_en: event.target.value })}
              aria-label="Fecha de vencimiento opcional"
            />
          </div>
          <label className="block text-xs font-semibold uppercase text-slate-500" htmlFor="bulk-number-mode">
            Codigo institucional
          </label>
          <select
            id="bulk-number-mode"
            className="field"
            value={form.numero_modo}
            onChange={(event) => setForm({ ...form, numero_modo: event.target.value })}
          >
            <option value="AUTOMATICO">Automatico no secuencial recomendado</option>
            <option value="CORRELATIVO">Correlativo institucional</option>
          </select>
          <p className="text-xs leading-5 text-slate-500">
            Es una referencia administrativa para ubicar el expediente. El QR usa un token aleatorio independiente.
          </p>

          <div className={form.numero_modo === "CORRELATIVO" ? "grid grid-cols-[minmax(0,1fr)_110px] gap-2" : "grid gap-2"}>
            <input
              className="field"
              value={form.numero_prefijo}
              onChange={(event) => setForm({ ...form, numero_prefijo: event.target.value })}
              placeholder="Prefijo"
              required
            />
            {form.numero_modo === "CORRELATIVO" && (
              <input
                className="field"
                type="number"
                min="1"
                value={form.numero_inicio}
                onChange={(event) => setForm({ ...form, numero_inicio: Number(event.target.value) })}
                aria-label="Inicio correlativo"
                required
              />
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <select
              className="field"
              value={form.origen}
              onChange={(event) => setForm({ ...form, origen: event.target.value })}
            >
              <option value="NUEVO">Nuevo</option>
              <option value="HISTORICO">Historico</option>
            </select>
            <input
              className="field"
              value={form.actor}
              onChange={(event) => setForm({ ...form, actor: event.target.value })}
              placeholder="Responsable"
              required
            />
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-600 transition hover:border-civic hover:bg-blue-50/60">
            <Upload className="h-5 w-5 text-civic" />
            <span className="font-semibold text-slate-700">{file ? file.name : "Seleccionar Excel o CSV de participantes"}</span>
            <span className="text-xs text-slate-500">XLSX o CSV, maximo 500 filas. Columnas: nombres, apellidos, tipo_documento, numero_documento.</span>
            <input
              className="sr-only"
              type="file"
              accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setPreview(null);
                setResult(null);
              }}
            />
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-600">
            <input
              className="mt-1"
              type="checkbox"
              checked={form.allow_skip_invalid}
              onChange={(event) => setForm({ ...form, allow_skip_invalid: event.target.checked })}
            />
            <span>Permitir importar solo filas validas si el archivo tiene errores.</span>
          </label>

          <button className="primary-button w-full" disabled={busy || !file || !form.type_id} type="submit">
            <FileSearch className="h-4 w-4" />
            {busy ? "Procesando" : "Validar archivo"}
          </button>
        </form>

        <div className="space-y-5">
          {message && <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{message}</p>}

          <section className="panel overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <h2 className="text-base font-semibold text-ink">Previsualizacion</h2>
                <p className="text-sm text-slate-500">Revisa errores y duplicados antes de crear certificados.</p>
              </div>
              <button className="primary-button" type="button" disabled={!canImport || busy} onClick={importFile}>
                <FileCheck2 className="h-4 w-4" />
                Confirmar importacion
              </button>
            </div>

            {preview ? (
              <>
                <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-3">
                  <Info label="Filas" value={preview.total_rows} />
                  <Info label="Validas" value={preview.valid_rows} />
                  <Info label="Con errores" value={preview.error_rows} />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Fila</th>
                        <th className="px-4 py-3">Titular</th>
                        <th className="px-4 py-3">Documento</th>
                        <th className="px-4 py-3">Codigo institucional</th>
                        <th className="px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {preview.rows.slice(0, 100).map((row) => (
                        <tr key={row.row} className={row.errors.length ? "bg-red-50/60" : "hover:bg-slate-50"}>
                          <td className="px-4 py-3 font-semibold text-ink">{row.row}</td>
                          <td className="px-4 py-3 text-slate-700">{row.nombres} {row.apellidos}</td>
                          <td className="px-4 py-3 text-slate-600">{row.tipo_documento} {row.documento_mascara}</td>
                          <td className="px-4 py-3 text-slate-600">{row.numero_institucional}</td>
                          <td className="px-4 py-3">
                            <p className={`font-semibold ${row.errors.length ? "text-danger" : "text-emerald-700"}`}>
                              {row.errors.length ? "Con errores" : "Valida"}
                            </p>
                            {[...row.errors, ...row.warnings].length ? (
                              <p className="mt-1 max-w-md text-xs text-slate-500">
                                {[...row.errors, ...row.warnings].join(", ")}
                              </p>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.rows.length > 100 && (
                  <p className="border-t border-slate-200 p-3 text-xs text-slate-500">
                    Se muestran las primeras 100 filas para mantener la pantalla agil.
                  </p>
                )}
              </>
            ) : (
              <div className="grid min-h-[320px] place-items-center p-6 text-center">
                <div>
                  <ClipboardCheck className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-3 font-semibold text-ink">Aun no hay archivo validado</p>
                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    Descarga la plantilla, carga los participantes y valida antes de importar.
                  </p>
                </div>
              </div>
            )}
          </section>

          {result && (
            <section className="panel p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink">Resultado de importacion</h2>
                  <p className="text-sm text-slate-500">
                    {result.created} certificados creados con QR. {result.skipped} filas omitidas.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button className="primary-button" type="button" disabled={busy || !result.created} onClick={submitImportedToReview}>
                    <ClipboardCheck className="h-4 w-4" />
                    Enviar a revision
                  </button>
                  <button className="secondary-button" type="button" onClick={downloadResult}>
                    <FileCheck2 className="h-4 w-4" />
                    Descargar resultado
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-200 p-4 sm:p-5">
              <h2 className="text-base font-semibold text-ink">Historial reciente</h2>
              <p className="text-sm text-slate-500">Ultimas cargas masivas registradas en el sistema.</p>
            </div>
            {history.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Titulo</th>
                      <th className="px-4 py-3">Creados</th>
                      <th className="px-4 py-3">Omitidos</th>
                      <th className="px-4 py-3">Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{item.created_at}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink">{item.titulo}</p>
                          <p className="text-xs text-slate-500">{item.programa ?? item.certificate_type}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-700">{item.created_count}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{item.skipped_count}</td>
                        <td className="px-4 py-3 text-slate-600">{item.actor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-sm text-slate-500">Aun no hay cargas masivas registradas.</div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function ReviewView({ refreshKey, onRefresh }) {
  const { data: reviewQueue, usingFallback } = useApiData("/admin/review-queue", fallbackReviewQueue, refreshKey);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  async function runAction(item, action, reason = "") {
    if (!item.id || item.id.startsWith?.("REV-")) {
      setMessage("Esta fila es de respaldo local; levanta el backend para operar estados reales.");
      return;
    }
    setBusyId(`${item.id}-${action}`);
    setMessage("");
    try {
      await apiRequest(`/admin/certificates/${item.id}/${action}`, {
        method: "POST",
        body: JSON.stringify({
          actor: "Autoridad SICV",
          reason,
        }),
      });
      setMessage("Estado actualizado y auditoria registrada.");
      onRefresh();
    } catch (error) {
      setMessage(`No se pudo actualizar: ${error.message}`);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Flujo de aprobacion"
        title="Cola de revision"
        description="Separacion entre registro y aprobacion, con observaciones y publicacion controlada."
      />
      {usingFallback && (
        <Notice tone="warning">No se pudo conectar al servicio. Se muestra una cola de respaldo.</Notice>
      )}
      {message && <Notice>{message}</Notice>}
      {reviewQueue.length === 0 && (
        <Notice tone="success">No hay certificados pendientes. Los nuevos borradores apareceran aqui.</Notice>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        {reviewQueue.map((item) => (
          <article key={item.id} className="panel p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">{item.code ?? item.id}</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">{item.holder}</h2>
              </div>
              <StatusBadge value={item.status} />
            </div>
            <StatusHint value={item.status} />
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <Protection icon={FileCheck2} text={item.title} />
              <Protection icon={CalendarClock} text={item.updated} />
              <Protection icon={ShieldCheck} text={item.risk} />
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              {item.status === "BORRADOR" || item.status === "OBSERVADO" ? (
                <button
                  className="primary-button flex-1"
                  disabled={busyId === `${item.id}-submit`}
                  onClick={() => runAction(item, "submit", "Listo para revision")}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Enviar
                </button>
              ) : null}
              {item.status === "EN_REVISION" ? (
                <>
                  <button
                    className="primary-button flex-1"
                    disabled={busyId === `${item.id}-approve`}
                    onClick={() => runAction(item, "approve", "Revision conforme")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aprobar
                  </button>
                  <button
                    className="secondary-button flex-1"
                    disabled={busyId === `${item.id}-observe`}
                    onClick={() => runAction(item, "observe", "Requiere correccion documental")}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Observar
                  </button>
                </>
              ) : null}
              {item.status === "APROBADO" ? (
                <button
                  className="primary-button flex-1"
                  disabled={busyId === `${item.id}-publish`}
                  onClick={() => runAction(item, "publish", "Publicacion autorizada")}
                >
                  <QrCode className="h-4 w-4" />
                  Publicar
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PoliciesView({ refreshKey, onRefresh }) {
  const { data: policy, usingFallback } = useApiData("/admin/disclosure-policy", fallbackPolicy, refreshKey);
  const [form, setForm] = useState({
    descripcion: "Nombre, codigo, titulo, institucion, fecha y estado",
    mostrar_codigo: true,
    mostrar_nombre: true,
    mostrar_documento: false,
    mostrar_fechas: true,
    mostrar_programa: true,
    permitir_documento_completo: false,
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({
      descripcion: policy.descripcion ?? "Nombre, codigo, titulo, institucion, fecha y estado",
      mostrar_codigo: policy.mostrar_codigo ?? true,
      mostrar_nombre: policy.mostrar_nombre ?? true,
      mostrar_documento: policy.mostrar_documento ?? false,
      mostrar_fechas: policy.mostrar_fechas ?? true,
      mostrar_programa: policy.mostrar_programa ?? true,
      permitir_documento_completo: policy.permitir_documento_completo ?? false,
    });
  }, [policy]);

  const fields = [
    ["Codigo institucional", policy.mostrar_codigo],
    ["Nombre del titular", policy.mostrar_nombre],
    ["DNI completo", policy.mostrar_documento],
    ["Vista previa publica del certificado", policy.permitir_documento_completo],
    ["Fechas de emision y vencimiento", policy.mostrar_fechas],
    ["Programa academico", policy.mostrar_programa],
  ];

  async function savePolicy(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await apiRequest("/admin/disclosure-policy", {
        method: "POST",
        body: JSON.stringify({ ...form, actor: "Legal + Direccion" }),
      });
      setMessage("Nueva politica activada y auditada.");
      onRefresh();
    } catch (error) {
      setMessage(`No se pudo activar politica: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Privacidad"
        title="Politicas de divulgacion"
        description="Control versionado de los campos visibles en la ficha publica y del acceso a documentos completos."
      />
      {usingFallback && (
        <Notice tone="warning">No se pudo conectar al servicio. Se muestra una politica de respaldo.</Notice>
      )}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">Politica activa v{policy.version}</h2>
              <p className="text-sm text-slate-500">{policy.descripcion}</p>
            </div>
            <StatusBadge value="PUBLICADO" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {fields.map(([label, enabled]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span
                  className={`h-6 w-11 rounded-full p-1 transition ${
                    enabled ? "bg-civic" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </div>
            ))}
          </div>
          <Notice tone={policy.permitir_documento_completo ? "success" : "warning"}>
            {policy.permitir_documento_completo
              ? "La vista previa del certificado esta visible en la verificacion publica para certificados publicados con documento cargado."
              : "La vista previa del certificado esta oculta en la verificacion publica. Activa la opcion de vista previa para mostrarla."}
          </Notice>
        </div>

        <aside className="panel p-4 sm:p-5">
          <h2 className="text-base font-semibold text-ink">Condiciones de activacion</h2>
          <div className="mt-4 space-y-3">
            <Protection icon={KeyRound} text="Aprobacion legal vinculada a evidencia interna." />
            <Protection icon={History} text="Version anterior conservada para trazabilidad." />
            <Protection icon={LockKeyhole} text="Documento completo mediante URL efimera." />
          </div>
          <form className="mt-5 space-y-3 border-t border-slate-200 pt-4" onSubmit={savePolicy}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                form.permitir_documento_completo
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={form.permitir_documento_completo}
                onChange={(event) => setForm({ ...form, permitir_documento_completo: event.target.checked })}
                className="mt-1 h-4 w-4 accent-civic"
              />
              <span>
                <span className="block font-semibold text-ink">Mostrar vista previa del certificado en verificacion publica</span>
                <span className="mt-1 block text-sm text-slate-600">
                  Permite que la imagen o PDF cargado aparezca debajo de los datos cuando el certificado este publicado.
                </span>
              </span>
            </label>
            <textarea
              className="field min-h-24 py-3"
              value={form.descripcion}
              onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
              required
            />
            {[
              ["mostrar_nombre", "Mostrar nombre"],
              ["mostrar_documento", "Mostrar documento enmascarado"],
              ["mostrar_programa", "Mostrar programa"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
                {label}
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.checked })}
                  className="h-4 w-4 accent-civic"
                />
              </label>
            ))}
            {form.permitir_documento_completo && (
              <Notice tone="danger">
                Esta opcion puede hacer visible el documento completo en la verificacion publica de certificados publicados.
                Verifica que exista aprobacion legal antes de activarla.
              </Notice>
            )}
            <button className="primary-button w-full" disabled={busy} type="submit">
              <ShieldCheck className="h-4 w-4" />
              Activar nueva version
            </button>
          </form>
          {message && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
        </aside>
      </section>
    </div>
  );
}

function AuditView({ refreshKey }) {
  const { data: auditEvents, usingFallback } = useApiData("/admin/audit-events", fallbackAuditEvents, refreshKey);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Trazabilidad"
        title="Auditoria"
        description="Eventos relevantes para reconstruir emision, publicacion, revocacion y accesos sensibles."
      />
      {usingFallback && (
        <Notice tone="warning">No se pudo conectar al servicio. Se muestra auditoria de respaldo.</Notice>
      )}
      <section className="panel overflow-hidden">
        <div className="divide-y divide-slate-100">
          {auditEvents.map((event) => {
            const time = event.time ?? event[0];
            const action = event.action ?? event[1];
            const target = event.target ?? event[2];
            const actor = event.actor ?? event[3];
            return (
              <div
                key={`${time}-${action}-${target}`}
                className="flex flex-col gap-2 p-4 sm:grid sm:grid-cols-[100px_1fr_1.4fr_1fr] sm:items-center sm:gap-4 sm:p-5 hover:bg-slate-50/80 transition"
              >
                <div className="flex items-center justify-between sm:block">
                  <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded">
                    {time}
                  </span>
                  <span className="sm:hidden text-xs text-slate-500">{actor}</span>
                </div>
                <div>
                  <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-xs font-semibold text-civic">
                    {action}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700 break-all">{target}</span>
                <span className="hidden sm:block text-xs text-slate-500">{actor}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SettingsView() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ razon_social: "", dominio_verificacion: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [notice, setNotice] = useState(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/admin/settings");
      setSettings(data);
      setForm({
        razon_social: data.institution?.razon_social ?? "",
        dominio_verificacion: data.institution?.dominio_verificacion ?? "",
      });
    } catch (err) {
      setNotice({ type: "danger", text: `Error al cargar la configuración: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      await apiRequest("/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          razon_social: form.razon_social.trim(),
          dominio_verificacion: form.dominio_verificacion.trim(),
        }),
      });
      setNotice({
        type: "success",
        text: "Configuración guardada exitosamente. El nuevo dominio ya está activo para los próximos certificados.",
      });
      await loadSettings();
    } catch (err) {
      setNotice({ type: "danger", text: `Error al guardar configuración: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateQrs = async () => {
    setRegenerating(true);
    setNotice(null);
    setShowRegenerateConfirm(false);
    try {
      const res = await apiRequest("/admin/settings/regenerate-qrs", { method: "POST" });
      setNotice({
        type: "success",
        text: `¡Éxito! ${res.message} Todos los certificados ahora tienen incrustada la URL oficial actual.`,
      });
      await loadSettings();
    } catch (err) {
      setNotice({ type: "danger", text: `Error al regenerar códigos QR: ${err.message}` });
    } finally {
      setRegenerating(false);
    }
  };

  const computedPreview = useMemo(() => {
    const raw = form.dominio_verificacion.trim();
    if (!raw) return "http://localhost:5173/v/SICV-DEMO-001";
    const cleaned = raw.replace(/\/+$/, "");
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
      const base = cleaned.endsWith("/v") ? cleaned : `${cleaned}/v`;
      return `${base}/SICV-DEMO-001`;
    }
    const scheme = cleaned.includes("localhost") || cleaned.includes("127.0.0.1") ? "http" : "https";
    return `${scheme}://${cleaned}/v/SICV-DEMO-001`;
  }, [form.dominio_verificacion]);

  const isLocalDomain =
    form.dominio_verificacion.includes("localhost") ||
    form.dominio_verificacion.includes("127.0.0.1") ||
    !form.dominio_verificacion;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sistema y Dominio"
        title="Configuración de la Aplicación"
        description="Configura el dominio oficial y la identidad institucional requeridos para la generación, lectura y verificación pública de los códigos QR."
      />

      {notice && (
        <Notice tone={notice.type}>{notice.text}</Notice>
      )}

      {/* Banner de Estado del Entorno */}
      <div
        className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
          isLocalDomain
            ? "border-amber-200 bg-amber-50/80 text-amber-900"
            : "border-blue-200 bg-blue-50/80 text-blue-950"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isLocalDomain ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-civic"
            }`}
          >
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {isLocalDomain ? "Modo Local de Desarrollo" : "Modo Producción Oficial"}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  isLocalDomain ? "bg-amber-200/80 text-amber-800" : "bg-blue-200/80 text-blue-900"
                }`}
              >
                {isLocalDomain ? "HTTP / localhost" : "HTTPS Seguro"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600">
              {isLocalDomain
                ? "El dominio actual es localhost. Los QR generados en este modo solo podrán escanearse dentro de esta misma máquina."
                : "Dominio oficial activo. Los QR generados podrán escanearse desde cualquier smartphone conectado a internet."}
            </p>
          </div>
        </div>

        {settings && (
          <div className="flex shrink-0 items-center gap-4 text-xs font-medium text-slate-600 sm:text-right">
            <div>
              <span className="block text-slate-400">Total certificados</span>
              <span className="text-sm font-bold text-ink">{settings.certificates_count}</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="block text-slate-400">Publicados</span>
              <span className="text-sm font-bold text-civic">{settings.published_count}</span>
            </div>
          </div>
        )}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Panel 1: Formulario de Identidad y Dominio */}
        <div className="panel p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Identidad y Dominio de Verificación</h2>
              <p className="text-xs text-slate-500">Parámetros que componen los enlaces de validación pública.</p>
            </div>
            <Globe className="h-5 w-5 text-slate-400" />
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Razón Social de la Institución
              </label>
              <input
                type="text"
                className="field mt-1.5"
                placeholder="Ej. Institución Educativa Demo"
                value={form.razon_social}
                onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                required
                disabled={loading || saving}
              />
              <p className="mt-1 text-xs text-slate-500">
                Aparece como entidad emisora en las fichas públicas de verificación.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Dominio o URL de Verificación Pública
              </label>
              <input
                type="text"
                className="field mt-1.5 font-mono text-sm"
                placeholder="Ej. certificados.miinstitucion.edu.pe o https://certificados.edu.pe/v"
                value={form.dominio_verificacion}
                onChange={(e) => setForm({ ...form, dominio_verificacion: e.target.value })}
                required
                disabled={loading || saving}
              />
              <p className="mt-1 text-xs text-slate-500">
                Puedes ingresar solo el dominio (ej. <code className="rounded bg-slate-100 px-1 py-0.5">certificados.miinstitucion.edu.pe</code>) o la URL base completa.
              </p>
            </div>

            {/* Vista previa en vivo del enlace QR */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <QrCode className="h-4 w-4 text-civic" />
                <span>Previsualización del enlace en el código QR:</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 rounded bg-white p-2 font-mono text-xs text-slate-800 border border-slate-200 break-all">
                <span>{computedPreview}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Cualquier persona que escanee el QR impreso en el certificado será enviada a esta dirección.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="primary-button w-full sm:w-auto"
                disabled={loading || saving}
              >
                <Save className="h-4 w-4" />
                {saving ? "Guardando cambios..." : "Guardar Configuración"}
              </button>
            </div>
          </form>
        </div>

        {/* Panel 2: Mantenimiento y Regeneración de QR */}
        <div className="panel flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Mantenimiento de Códigos QR</h2>
                <p className="text-xs text-slate-500">Sincronización de certificados existentes con el nuevo dominio.</p>
              </div>
              <QrCode className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">¿Por qué es necesario regenerar?</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Los códigos QR son imágenes vectoriales fijas con la URL incrustada en sus píxeles. Si creaste certificados en <code className="rounded bg-slate-200 px-1 py-0.5">localhost</code> y ahora pasas a producción con un dominio real, debes regenerarlos para que los nuevos PDF descargados lleven el enlace oficial.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-500">
                <Protection icon={ShieldCheck} text="Actualiza las imágenes SVG y los registros en PostgreSQL." />
                <Protection icon={FileCheck2} text="Aplica a todos los certificados emitidos e históricos." />
                <Protection icon={AlertTriangle} text="Los diplomas ya impresos en papel físico no cambian automáticamente." />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            {!showRegenerateConfirm ? (
              <button
                type="button"
                className="secondary-button w-full justify-center text-slate-700 hover:border-amber-400 hover:text-amber-800"
                onClick={() => setShowRegenerateConfirm(true)}
                disabled={regenerating}
              >
                <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
                {regenerating ? "Regenerando códigos QR..." : "Regenerar Códigos QR Existentes"}
              </button>
            ) : (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3.5 space-y-3">
                <p className="text-xs font-semibold text-amber-900">
                  ¿Confirmas regenerar los QR para los {settings?.certificates_count ?? "todos los"} certificados con la URL actual?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="primary-button bg-amber-700 hover:bg-amber-800 text-xs py-1.5 px-3 h-auto"
                    onClick={handleRegenerateQrs}
                    disabled={regenerating}
                  >
                    {regenerating ? "Procesando..." : "Sí, regenerar ahora"}
                  </button>
                  <button
                    type="button"
                    className="secondary-button text-xs py-1.5 px-3 h-auto"
                    onClick={() => setShowRegenerateConfirm(false)}
                    disabled={regenerating}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Guía técnica para Producción y Hosting */}
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-ink">¿Cómo llevar este sistema a Hosting y Producción?</h2>
              <p className="text-xs text-slate-500">Pasos recomendados para desplegar en tu propio servidor o VPS.</p>
            </div>
            <Server className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-civic text-xs font-bold text-white">1</span>
              <h4 className="mt-2 text-xs font-semibold text-ink">1. Dominio y DNS</h4>
              <p className="mt-1 text-xs text-slate-600">
                Apunta un registro <code className="bg-slate-200 px-1 py-0.5 rounded">A</code> (ej. <code className="text-slate-800 font-mono">certificados.colegio.edu.pe</code>) a la IP de tu servidor VPS.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-civic text-xs font-bold text-white">2</span>
              <h4 className="mt-2 text-xs font-semibold text-ink">2. Reverse Proxy & SSL</h4>
              <p className="mt-1 text-xs text-slate-600">
                Usa Nginx, Caddy o Traefik con certificado SSL Let's Encrypt para que la verificación sea siempre <code className="text-slate-800 font-mono">HTTPS</code>.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-civic text-xs font-bold text-white">3</span>
              <h4 className="mt-2 text-xs font-semibold text-ink">3. Variables en .env</h4>
              <p className="mt-1 text-xs text-slate-600">
                Configura <code className="font-mono text-[11px] bg-slate-200 px-1 rounded">PUBLIC_VERIFICATION_BASE_URL</code> y <code className="font-mono text-[11px] bg-slate-200 px-1 rounded">CORS_ORIGINS</code> en el servidor.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-civic text-xs font-bold text-white">4</span>
              <h4 className="mt-2 text-xs font-semibold text-ink">4. Ajuste en este Panel</h4>
              <p className="mt-1 text-xs text-slate-600">
                Guarda tu nuevo dominio en este formulario y pulsa <strong>Regenerar QR</strong> para actualizar los certificados previos.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Endpoints y Servicios Conectados</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <Info label="Frontend URL" value={window.location.origin} />
              <Info label="Backend API" value={getApiBaseUrl()} />
              <Info label="URL Base de Verificación" value={settings?.effective_verification_base_url ?? "Cargando..."} />
              <Info label="Base de Datos" value="PostgreSQL 16 (Conectado)" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminAccessView({ onUnlock }) {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => getApiBaseUrl());
  const [customUrlInput, setCustomUrlInput] = useState(() => getApiBaseUrl());
  const [showConfig, setShowConfig] = useState(false);
  const [testStatus, setTestStatus] = useState(""); // "", "testing", "ok", "error", "warning"
  const [testMessage, setTestMessage] = useState("");

  const isRemoteAndLocalhost =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    apiUrl.includes("localhost");

  async function handleTestAndSaveUrl(urlToTest) {
    const clean = (urlToTest || "").trim().replace(/\/+$/, "");
    if (!clean) {
      setTestMessage("La URL no puede estar vacía.");
      setTestStatus("error");
      return;
    }
    setTestStatus("testing");
    setTestMessage("Verificando conexión con el backend...");

    const normalizedApiUrl = clean.endsWith("/api/v1") ? clean : `${clean}/api/v1`;
    const healthUrl = clean.endsWith("/api/v1") ? clean.replace(/\/api\/v1$/, "/health") : `${clean}/health`;

    try {
      const res = await fetch(healthUrl, { method: "GET" });
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        throw new Error("El endpoint devolvió HTML en vez de la API JSON de FastAPI. Esta URL apunta al frontend estático, no al backend.");
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      localStorage.setItem(API_URL_STORAGE_KEY, normalizedApiUrl);
      setApiUrl(normalizedApiUrl);
      setCustomUrlInput(normalizedApiUrl);
      setTestStatus("ok");
      const dbInfo = data?.database ? ` (Base de datos: ${data.database})` : "";
      setTestMessage(`¡Conexión exitosa con la API FastAPI!${dbInfo}`);
      setMessage("");
    } catch (err) {
      localStorage.setItem(API_URL_STORAGE_KEY, normalizedApiUrl);
      setApiUrl(normalizedApiUrl);
      setCustomUrlInput(normalizedApiUrl);
      setTestStatus("warning");
      setTestMessage(
        `Guardado como ${normalizedApiUrl}. Nota: la prueba /health arrojó: ${err?.message || err}. Puedes intentar entrar de todas formas.`
      );
    }
  }

  function handleResetUrl() {
    localStorage.removeItem(API_URL_STORAGE_KEY);
    const envUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
    setApiUrl(envUrl);
    setCustomUrlInput(envUrl);
    setTestStatus("");
    setTestMessage("Restablecido a la URL por defecto.");
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const cleaned = token.trim();
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, cleaned);
    try {
      try {
        await apiRequest("/admin/auth/verify");
      } catch (authErr) {
        if (authErr?.message?.includes("404")) {
          await apiRequest("/admin/summary");
        } else {
          throw authErr;
        }
      }
      onUnlock();
    } catch (err) {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      const errStr = String(err?.message || err);
      const currentUrl = getApiBaseUrl();
      if (
        errStr.includes("Failed to fetch") ||
        errStr.includes("NetworkError") ||
        errStr.includes("Load failed") ||
        errStr.includes("ERR_")
      ) {
        setMessage(
          `No se pudo conectar con el backend en "${currentUrl}". Verifica que el backend esté encendido en Railway y que la URL sea la correcta.`
        );
        setShowConfig(true);
      } else if (errStr.includes("admin_required") || errStr.includes("403") || errStr.includes("401")) {
        setMessage(
          "Clave administrativa no coincide con el token activo en Railway. Recuerda hacer clic en 'Add' y 'Deploy' en la pestaña Variables de Railway."
        );
      } else if (errStr.includes("PostgreSQL") || errStr.includes("DATABASE_URL") || errStr.includes("503") || errStr.includes("500")) {
        setMessage(
          `La clave fue aceptada, pero la Base de Datos no está conectada: ${errStr}. Configura DATABASE_URL en Railway.`
        );
      } else {
        setMessage(`Error al acceder: ${errStr}`);
      }
    } finally {
      setBusy(false);
    }
  }

  const shouldDisplayConfig = isRemoteAndLocalhost || showConfig;

  return (
    <div className="grid min-h-[calc(100vh-9rem)] place-items-center py-6">
      <form className="panel w-full max-w-lg p-5 sm:p-6 shadow-md" onSubmit={submit}>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-civic-light p-2.5 text-civic">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Acceso administrativo</h1>
            <p className="mt-1 text-sm text-slate-600">
              Solo administradores pueden ver QR, emitir certificados o modificar políticas.
            </p>
          </div>
        </div>

        {/* Alerta / Panel de Configuración de Backend (Railway o Producción) */}
        {shouldDisplayConfig && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-semibold text-sm text-amber-950">Conexión con el Backend en Railway</p>
                  <p className="mt-0.5 text-slate-700 leading-relaxed">
                    {isRemoteAndLocalhost
                      ? `La app está en producción pero intenta conectar a "${apiUrl}" (tu PC local), lo cual produce net::ERR_CONNECTION_REFUSED.`
                      : `Configura o cambia la URL de la API del backend a la que se conectará este navegador.`}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block font-medium text-slate-800" htmlFor="custom-backend-url">
                    URL Pública de tu Backend en Railway:
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="custom-backend-url"
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://tu-backend.up.railway.app/api/v1"
                      className="field flex-1 text-xs py-1.5 font-mono"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="primary-button text-xs py-1.5 px-3 shrink-0"
                        disabled={testStatus === "testing"}
                        onClick={() => handleTestAndSaveUrl(customUrlInput)}
                      >
                        {testStatus === "testing" ? "Probando..." : "Guardar y Probar"}
                      </button>
                      <button
                        type="button"
                        className="secondary-button text-xs py-1.5 px-2.5 shrink-0"
                        onClick={handleResetUrl}
                        title="Restablecer URL por defecto"
                      >
                        Restablecer
                      </button>
                    </div>
                  </div>
                  {testMessage && (
                    <p
                      className={`text-[11px] font-medium pt-1 ${
                        testStatus === "ok"
                          ? "text-emerald-700"
                          : testStatus === "warning"
                          ? "text-amber-800"
                          : "text-rose-700"
                      }`}
                    >
                      {testMessage}
                    </p>
                  )}
                </div>

                <div className="border-t border-amber-200/80 pt-2 text-[11px] text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">💡 Configuración definitiva para todos los usuarios:</p>
                  <p>1. En Railway, entra al servicio del <strong>Frontend</strong> → pestaña <strong>Variables</strong>.</p>
                  <p>2. Agrega la variable <code className="font-mono font-bold text-slate-800">VITE_API_URL</code> con valor <code className="font-mono text-slate-800">https://tu-backend.up.railway.app/api/v1</code></p>
                  <p>3. Pulsa <strong>Redeploy</strong> en el Frontend para que Vite compile con la nueva URL.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <label className="mt-5 block text-xs font-semibold uppercase text-slate-500" htmlFor="admin-token">
          Clave o Token de Administrador
        </label>
        <input
          id="admin-token"
          className="field mt-2"
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Ingresa la clave administrativa"
          required
        />
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>¿Entorno local?</span>
          <button
            type="button"
            className="font-medium text-civic hover:underline"
            onClick={() => setToken("sicv-admin-local")}
          >
            Usar clave demo (sicv-admin-local)
          </button>
        </div>

        <button className="primary-button mt-4 w-full" disabled={busy || !token.trim()} type="submit">
          <ShieldCheck className="h-4 w-4" />
          {busy ? "Verificando acceso..." : "Entrar"}
        </button>

        {message && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 leading-relaxed">{message}</p>}

        {/* Botón para alternar configuración del Backend manualmente */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-slate-400" />
            <span>API: <strong className="font-mono text-slate-700">{apiUrl}</strong></span>
          </span>
          <button
            type="button"
            className="text-civic font-medium hover:underline"
            onClick={() => setShowConfig(!showConfig)}
          >
            {showConfig ? "Ocultar ajustes" : "Cambiar API"}
          </button>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 space-y-1">
          <p className="font-semibold text-ink">Autenticación por Token:</p>
          <p>• La base de datos no requiere cuentas de usuario; se autentica mediante un token seguro.</p>
          <p>• <strong>Local:</strong> la clave por defecto es <code className="rounded bg-slate-200 px-1 py-0.5 text-slate-800">sicv-admin-local</code>.</p>
          <p>• <strong>Producción / Railway:</strong> la clave es la variable de entorno <code className="rounded bg-slate-200 px-1 py-0.5 text-slate-800">ADMIN_API_TOKEN</code> configurada en el servicio Backend.</p>
        </div>
      </form>
    </div>
  );
}

function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-civic">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal text-ink sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Protection({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-civic" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

function HealthRow({ label, value, good }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`text-sm font-semibold ${good ? "text-emerald-700" : "text-danger"}`}>{value}</span>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState("");
  const [routePath, setRoutePath] = useState(window.location.pathname);
  const [adminUnlocked, setAdminUnlocked] = useState(() => Boolean(localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)));
  const refresh = () => setRefreshKey((value) => value + 1);

  useEffect(() => {
    const syncRoute = () => setRoutePath(window.location.pathname);
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    setAdminUnlocked(false);
    setNotice("Vista administrativa cerrada localmente.");
    setActiveView("dashboard");
    window.history.pushState({}, "", "/");
    setRoutePath("/");
  };
  const views = {
    dashboard: <DashboardView refreshKey={refreshKey} onRefresh={refresh} />,
    bulk: <BulkImportView refreshKey={refreshKey} onRefresh={refresh} />,
    review: <ReviewView refreshKey={refreshKey} onRefresh={refresh} />,
    policies: <PoliciesView refreshKey={refreshKey} onRefresh={refresh} />,
    audit: <AuditView refreshKey={refreshKey} />,
    settings: <SettingsView />,
  };
  const isAdminRoute = routePath.startsWith("/admin");

  if (!isAdminRoute) {
    return (
      <PublicShell>
        <VerifyView />
      </PublicShell>
    );
  }

  if (!adminUnlocked) {
    return (
      <PublicShell>
        {notice && (
          <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {notice}
          </div>
        )}
        <AdminAccessView
          onUnlock={() => {
            setAdminUnlocked(true);
            setNotice("");
            setActiveView("dashboard");
            refresh();
          }}
        />
      </PublicShell>
    );
  }

  return (
    <Shell activeView={activeView} setActiveView={setActiveView} onLogout={logout}>
      {notice && (
        <div className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {notice}
        </div>
      )}
      {views[activeView]}
    </Shell>
  );
}
