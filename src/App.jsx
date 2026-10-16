import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSearch,
  Globe,
  History,
  Image,
  KeyRound,
  LockKeyhole,
  LogOut,
  Menu,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Upload,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
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
};

const fallbackBulkHistory = [];

function normalizeCertificate(certificate) {
  return {
    id: certificate.id,
    code: certificate.code,
    token: certificate.token ?? certificate.code,
    holder: certificate.holder,
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
    hasDocument: certificate.has_document ?? certificate.hasDocument ?? false,
    documentPublic: certificate.document_public ?? certificate.documentPublic ?? false,
    hasQr: certificate.has_qr ?? certificate.hasQr ?? false,
    qrUrl: certificate.qr_url ?? certificate.qrUrl,
  };
}

async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const adminToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  const adminHeaders = path.startsWith("/admin") && adminToken ? { "X-Admin-Token": adminToken } : {};
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
  return response.json();
}

function useApiData(path, fallbackValue, refreshKey = 0) {
  const [data, setData] = useState(fallbackValue);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    apiRequest(path)
      .then((payload) => {
        if (!active) return;
        setData(payload);
        setUsingFallback(false);
      })
      .catch(() => {
        if (!active) return;
        setData(fallbackValue);
        setUsingFallback(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [path, fallbackValue, refreshKey]);

  return { data, loading, usingFallback };
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

    fetch(`${API_BASE_URL}${path}`, {
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

    fetch(`${API_BASE_URL}${path}`)
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
        setError("No se pudo cargar el documento.");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, enabled, refreshKey]);

  return { blobUrl, contentType, error };
}

function CertificateDocumentPreview({ blobUrl, contentType, title, alt }) {
  const isImage = contentType.toLowerCase().startsWith("image/");

  if (isImage) {
    return (
      <div className="grid min-h-[360px] place-items-center bg-slate-50 p-3 sm:min-h-[420px]">
        <img
          className="block max-h-[70vh] max-w-full rounded-lg object-contain"
          src={blobUrl}
          alt={alt}
        />
      </div>
    );
  }

  return (
    <object
      className="h-[70vh] min-h-[420px] w-full rounded-lg bg-slate-50"
      data={blobUrl}
      type={contentType || "application/pdf"}
      title={title}
    >
      <div className="grid min-h-[360px] place-items-center p-6 text-center">
        <div>
          <Image className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 font-semibold text-ink">No se pudo mostrar la vista previa</p>
          <p className="mt-1 text-sm text-slate-500">Descarga el archivo para revisarlo.</p>
        </div>
      </div>
    </object>
  );
}

async function downloadProtectedFile(path, filename) {
  const adminToken = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
  const pathToken = window.location.pathname.startsWith("/v/")
    ? decodeURIComponent(window.location.pathname.replace("/v/", ""))
    : "";
  const initialToken = pathToken;
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
    fetch(`${API_BASE_URL}/public/certificates/${encodeURIComponent(token)}`)
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
  const publicDocumentPath = `/public/certificates/${encodeURIComponent(certificate.token)}/document`;
  const publicDocument = usePublicBlob(publicDocumentPath, Boolean(valid && certificate.hasDocument && certificate.documentPublic));

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
        <Info label="Documento" value="No publico" />
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

      {valid && certificate.hasDocument && certificate.documentPublic ? (
        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-ink">Documento del certificado</p>
            <p className="text-xs text-slate-500">Visible porque la politica de divulgacion activa lo permite.</p>
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
                <Image className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-3 font-semibold text-ink">Cargando documento</p>
                <p className="mt-1 text-sm text-slate-500">
                  {publicDocument.error || "Estamos preparando la vista previa del certificado."}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : certificate.hasDocument ? (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-civic" />
          <span>El documento existe, pero la politica activa no permite mostrarlo publicamente.</span>
        </div>
      ) : null}
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
  const certificates = certificatesResource.data.map(normalizeCertificate);
  const summary = summaryResource.data;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operacion"
        title="Panel institucional"
        description="Resumen operativo para seguimiento de emision, revision, publicacion y control de riesgos."
      />
      {(certificatesResource.usingFallback || summaryResource.usingFallback) && (
        <Notice tone="warning">
          No se pudo conectar al servicio. Se muestran datos de respaldo mientras se restablece la conexion.
        </Notice>
      )}
      <WorkflowGuide />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileCheck2} label="Publicados" value={summary.published} helper="Registro oficial" />
        <StatCard icon={ClipboardCheck} label="En revision" value={summary.in_review} helper="Incluye observados" tone="text-signal" />
        <StatCard icon={BadgeCheck} label="Politicas activas" value={summary.active_policies} helper="Versionadas y auditadas" tone="text-sky-700" />
        <StatCard icon={AlertTriangle} label="Revocados" value={summary.revoked} helper="Todos con motivo registrado" tone="text-danger" />
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-base font-semibold text-ink">Certificados recientes</h2>
              <p className="text-sm text-slate-500">Estados visibles para control interno.</p>
            </div>
            <button className="secondary-button" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
          <ResponsiveTable certificates={certificates} onRefresh={onRefresh} />
        </div>

        <div className="space-y-5">
          <QuickCreatePanel catalog={catalogResource.data} onSaved={onRefresh} />
          <div className="panel p-4 sm:p-5">
            <h2 className="text-base font-semibold text-ink">Salud del servicio</h2>
            <div className="mt-5 space-y-4">
              <HealthRow label="API publica" value="Activa" good />
              <HealthRow label="PostgreSQL" value="Conectado" good />
              <HealthRow label="Backups" value="Pendiente ops" good />
              <HealthRow label="Rate limit" value="Planeado" good />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickCreatePanel({ catalog, onSaved }) {
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
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const holders = catalog.holders ?? [];
  const types = catalog.types ?? [];

  async function createHolder(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const holder = await apiRequest("/admin/holders", {
        method: "POST",
        body: JSON.stringify(holderForm),
      });
      setCertificateForm((current) => ({ ...current, holder_id: holder.id }));
      setHolderForm({ tipo_documento: "DNI", documento: "", nombres: "", apellidos: "" });
      setMessage("Titular creado y seleccionado para el certificado.");
      onSaved();
    } catch (error) {
      setMessage(`No se pudo crear titular: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function createCertificate(event) {
    event.preventDefault();
    const form = event.currentTarget;
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
      setCertificateForm((current) => ({
        ...current,
        numero_institucional: `SICV-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`,
        titulo: "",
        programa: "",
        vence_en: "",
      }));
      setCertificateFile(null);
      form.reset();
      setMessage(
        certificateFile
          ? "Borrador creado con documento y QR de verificacion. Puedes enviarlo a revision desde la cola."
          : "Borrador creado con QR de verificacion. Puedes cargar el documento despues desde Expediente.",
      );
      onSaved();
    } catch (error) {
      setMessage(`No se pudo crear certificado: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-civic">
          <FileCheck2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">Registro guiado</h2>
          <p className="text-sm text-slate-500">
            Crea el titular, registra el certificado y adjunta su documento antes de enviarlo a revision.
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-5">
        <form className="space-y-3" onSubmit={createHolder}>
          <p className="text-sm font-semibold text-slate-700">Paso 1: titular</p>
          <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-2">
            <label className="sr-only" htmlFor="holder-doc-type">Tipo</label>
            <select
              id="holder-doc-type"
              className="field"
              value={holderForm.tipo_documento}
              onChange={(event) => setHolderForm({ ...holderForm, tipo_documento: event.target.value })}
            >
              <option>DNI</option>
              <option>CE</option>
              <option>PAS</option>
            </select>
            <label className="sr-only" htmlFor="holder-doc-number">Numero de documento</label>
            <input
              id="holder-doc-number"
              className="field"
              value={holderForm.documento}
              onChange={(event) => setHolderForm({ ...holderForm, documento: event.target.value })}
              placeholder="Numero"
              required
            />
          </div>
          <input
            aria-label="Nombres del titular"
            className="field"
            value={holderForm.nombres}
            onChange={(event) => setHolderForm({ ...holderForm, nombres: event.target.value })}
            placeholder="Nombres"
            required
          />
          <input
            aria-label="Apellidos del titular"
            className="field"
            value={holderForm.apellidos}
            onChange={(event) => setHolderForm({ ...holderForm, apellidos: event.target.value })}
            placeholder="Apellidos"
            required
          />
          <button className="secondary-button w-full" disabled={busy} type="submit">
            <UserRoundCheck className="h-4 w-4" />
            Crear titular
          </button>
        </form>

        <form className="space-y-3 border-t border-slate-200 pt-4" onSubmit={createCertificate}>
          <p className="text-sm font-semibold text-slate-700">Paso 2: certificado y documento</p>
          <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="certificate-holder">
            Titular
          </label>
          <select
            id="certificate-holder"
            className="field"
            value={certificateForm.holder_id}
            onChange={(event) => setCertificateForm({ ...certificateForm, holder_id: event.target.value })}
            required
          >
            <option value="">Seleccionar titular</option>
            {holders.map((holder) => (
              <option key={holder.id} value={holder.id}>
                {holder.name} - {holder.document}
              </option>
            ))}
          </select>
          <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="certificate-type">
            Tipo de certificado
          </label>
          <select
            id="certificate-type"
            className="field"
            value={certificateForm.type_id}
            onChange={(event) => setCertificateForm({ ...certificateForm, type_id: event.target.value })}
            required
          >
            <option value="">Tipo de certificado</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="certificate-number">
            Codigo institucional
          </label>
          <input
            id="certificate-number"
            className="field"
            value={certificateForm.numero_institucional}
            onChange={(event) =>
              setCertificateForm({ ...certificateForm, numero_institucional: event.target.value })
            }
            required
          />
          <p className="text-xs leading-5 text-slate-500">
            Referencia administrativa para ubicar el expediente. El QR se genera con un token aleatorio independiente.
          </p>
          <input
            aria-label="Titulo del certificado"
            className="field"
            value={certificateForm.titulo}
            onChange={(event) => setCertificateForm({ ...certificateForm, titulo: event.target.value })}
            placeholder="Titulo del certificado"
            required
          />
          <input
            aria-label="Programa"
            className="field"
            value={certificateForm.programa}
            onChange={(event) => setCertificateForm({ ...certificateForm, programa: event.target.value })}
            placeholder="Programa"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="field"
              type="date"
              value={certificateForm.fecha_emision}
              onChange={(event) => setCertificateForm({ ...certificateForm, fecha_emision: event.target.value })}
              required
            />
            <select
              className="field"
              value={certificateForm.origen}
              onChange={(event) => setCertificateForm({ ...certificateForm, origen: event.target.value })}
            >
              <option value="NUEVO">Nuevo</option>
              <option value="HISTORICO">Historico</option>
            </select>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-600 transition hover:border-civic hover:bg-blue-50/60">
            <Upload className="h-5 w-5 text-civic" />
            <span className="font-semibold text-slate-700">
              {certificateFile ? certificateFile.name : "Subir imagen o PDF del certificado"}
            </span>
            <span className="text-xs text-slate-500">PNG, JPG, WEBP o PDF hasta 10 MB</span>
            <input
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(event) => setCertificateFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <button className="primary-button w-full" disabled={busy} type="submit">
            <FileCheck2 className="h-4 w-4" />
            Crear borrador
          </button>
        </form>

        {message && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
      </div>
    </section>
  );
}

function ResponsiveTable({ certificates, onRefresh }) {
  const [message, setMessage] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [revocationTarget, setRevocationTarget] = useState(null);

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
      setMessage("Certificado revocado. La verificacion publica reflejara el nuevo estado.");
      onRefresh();
    } catch (error) {
      setMessage(`No se pudo revocar: ${error.message}`);
    }
  }

  return (
    <>
      {message && <p className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</p>}
      
      {/* Vista de Tabla para Pantallas Medianas y Grandes (Tablet / Desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Codigo</th>
              <th className="px-4 py-3 font-semibold">Titular</th>
              <th className="px-4 py-3 font-semibold">Certificado</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold text-right">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {certificates.map((certificate) => (
              <tr key={certificate.id ?? certificate.token} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3.5 font-mono text-xs font-semibold text-civic">{certificate.code ?? certificate.token}</td>
                <td className="px-4 py-3.5 text-slate-700 font-medium">{certificate.holder}</td>
                <td className="px-4 py-3.5 text-slate-600">{certificate.title}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge value={certificate.status} />
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{certificate.issuedOn}</td>
                <td className="px-4 py-3.5 text-right">
                  <div className="inline-flex gap-2">
                    <button className="secondary-button min-h-9 px-3 py-1 text-xs" onClick={() => setSelectedCertificate(certificate)}>
                      <Eye className="h-3.5 w-3.5" />
                      Expediente
                    </button>
                    {certificate.status === "PUBLICADO" && (
                      <button className="secondary-button min-h-9 px-3 py-1 text-xs text-danger hover:border-red-300" onClick={() => setRevocationTarget(certificate)}>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Revocar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas Optimizada para Moviles (Smartphones) */}
      <div className="divide-y divide-slate-100 md:hidden">
        {certificates.map((certificate) => (
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
              <div className="flex gap-2">
                <button className="secondary-button min-h-8 px-2.5 py-1 text-xs" onClick={() => setSelectedCertificate(certificate)}>
                  <Eye className="h-3.5 w-3.5" />
                  Expediente
                </button>
                {certificate.status === "PUBLICADO" && (
                  <button className="secondary-button min-h-8 px-2.5 py-1 text-xs text-danger" onClick={() => setRevocationTarget(certificate)}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Revocar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onRefresh={onRefresh}
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

function CertificateModal({ certificate, onClose, onRefresh }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [documentAvailable, setDocumentAvailable] = useState(Boolean(certificate.hasDocument));
  const [resourceRefresh, setResourceRefresh] = useState(0);
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
      setMessage("Documento cargado correctamente.");
      onRefresh();
    } catch (error) {
      setMessage(`No se pudo cargar documento: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-3 sm:p-4">
      <section className="panel flex flex-col max-h-[94vh] w-full max-w-5xl overflow-hidden shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-civic">Detalle interno</p>
            <h2 className="mt-1 text-lg sm:text-xl font-semibold text-ink truncate">{certificate.title}</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-mono">{certificate.code ?? certificate.token}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar detalle">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
          <div className="min-h-[240px] sm:min-h-[360px] rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
            {documentAvailable ? (
              documentBlob.blobUrl ? (
                <CertificateDocumentPreview
                  blobUrl={documentBlob.blobUrl}
                  contentType={documentBlob.contentType}
                  title="Documento del certificado"
                  alt={`Documento de ${certificate.title}`}
                />
              ) : (
                <div className="grid min-h-[360px] place-items-center p-6 text-center">
                  <div>
                    <Image className="mx-auto h-10 w-10 text-slate-400" />
                    <p className="mt-3 font-semibold text-ink">Cargando documento protegido</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {documentBlob.error || "Estamos preparando la vista previa del certificado."}
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="grid min-h-[360px] place-items-center p-6 text-center">
                <div>
                  <Image className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-3 font-semibold text-ink">Sin documento cargado</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Carga una imagen o PDF para que el expediente tenga evidencia documental.
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-ink">QR de verificacion</p>
              <p className="mt-1 text-xs text-slate-500">
                Generado al registrar el certificado. Puede insertarse en el documento fisico o digital.
              </p>
              {certificate.id ? (
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  {qrBlob.blobUrl ? (
                    <img className="mx-auto h-40 w-40" src={qrBlob.blobUrl} alt="QR de verificacion" />
                  ) : (
                    <div className="mx-auto grid h-40 w-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs text-slate-500">
                      {qrBlob.error || "Cargando QR protegido"}
                    </div>
                  )}
                  <p className="mt-3 break-all rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                    {certificate.qrUrl ?? "URL de verificacion registrada en el QR"}
                  </p>
                  <button
                    className="secondary-button mt-3 w-full"
                    type="button"
                    onClick={async () => {
                      try {
                        await downloadProtectedFile(qrPath, `qr-${certificate.code ?? certificate.token}.svg`);
                      } catch (error) {
                        setMessage(`No se pudo descargar QR: ${error.message}`);
                      }
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                    Descargar QR
                  </button>
                </div>
              ) : (
                <Notice tone="warning">El QR no esta disponible para datos de respaldo local.</Notice>
              )}
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <StatusBadge value={certificate.status} />
              <dl className="mt-4 space-y-3 text-sm">
                <Info label="Titular" value={certificate.holder} />
                <Info label="Documento" value={certificate.maskedDocument ?? "No publico"} />
                <Info label="Emision" value={certificate.issuedOn} />
                <Info label="Programa" value={certificate.program ?? "No indicado"} />
              </dl>
            </div>
            <label className="secondary-button w-full cursor-pointer">
              <Upload className="h-4 w-4" />
              {busy ? "Cargando" : "Cargar/reemplazar documento"}
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={uploadDocument}
              />
            </label>
            {message && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
          </aside>
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
              <Info label="Backend API" value={API_BASE_URL} />
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

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token.trim());
    try {
      await apiRequest("/admin/summary");
      onUnlock();
    } catch {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      setMessage("Clave administrativa no valida.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-9rem)] place-items-center">
      <form className="panel w-full max-w-md p-5" onSubmit={submit}>
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-civic-light p-2 text-civic">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Acceso administrativo</h1>
            <p className="mt-1 text-sm text-slate-600">
              Solo administradores pueden ver QR, documentos internos o modificar certificados.
            </p>
          </div>
        </div>
        <label className="mt-5 block text-xs font-semibold uppercase text-slate-500" htmlFor="admin-token">
          Clave admin local
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
        <button className="primary-button mt-4 w-full" disabled={busy || !token.trim()} type="submit">
          <ShieldCheck className="h-4 w-4" />
          Entrar
        </button>
        {message && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
        <p className="mt-4 text-xs text-slate-500">
          En Docker local la clave por defecto es configurable con `ADMIN_API_TOKEN`.
        </p>
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
