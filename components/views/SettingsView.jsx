"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  LogOut,
  Monitor,
  Moon,
  Save,
  Smartphone,
  Sun,
  Users,
  Plus,
  Pencil,
  Trash2,
  Power,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { useApp } from "../AppContext";
import { api } from "@/lib/api";
import {
  Avatar,
  Badge,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Field,
  FilterTabs,
  GhostButton,
  IconButton,
  ImageField,
  LoadingState,
  Modal,
  Panel,
  PanelTitle,
  PrimaryButton,
  SelectField,
  Td,
  TextArea,
  Toggle,
  useForm,
  useToast,
} from "../ui";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";

export function SettingsView() {
  const { admin } = useApp();
  const isSuperAdmin = admin?.role === "super_admin";

  const tabs = [
    "Profil",
    "Keamanan",
    "Notifikasi",
    "Tampilan",
    "Sistem",
    ...(isSuperAdmin ? ["Kelola Admin"] : []),
  ];

  const [tab, setTab] = useState("Profil");

  return (
    <div className="space-y-4">
      <FilterTabs options={tabs} value={tab} onChange={setTab} />
      {tab === "Profil" && <ProfileTab />}
      {tab === "Keamanan" && <SecurityTab />}
      {tab === "Notifikasi" && <NotificationTab />}
      {tab === "Tampilan" && <AppearanceTab />}
      {tab === "Sistem" && <SystemTab />}
      {tab === "Kelola Admin" && isSuperAdmin && <AdminsTab />}
    </div>
  );
}

function useSave(path, method = "PATCH") {
  const { act } = useApp();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const save = async (body, success) => {
    setSaving(true);
    setErrors({});
    try {
      const res = await act(path, { method, body });
      toast(success);
      return res;
    } catch (e) {
      setErrors(e.fields || {});
      toast(e.message, "error");
      return null;
    } finally {
      setSaving(false);
    }
  };
  return { save, saving, errors };
}

function ProfileTab() {
  const { admin } = useApp();
  const form = useForm({
    name: admin.name,
    email: admin.email,
    phone: admin.phone || "",
    photo: admin.photo || "",
  });
  const { save, saving, errors } = useSave("settings/profile");

  return (
    <Panel className="max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <Avatar name={form.values.name} src={form.values.photo} size={64} />
        <div>
          <h2 className="text-2xl font-extrabold text-ink">{admin.name}</h2>
          <p className="text-muted">
            {admin.email} · <Badge status={admin.role} label={ROLE_LABELS[admin.role] || admin.role} />
          </p>
        </div>
      </div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save(form.values, "Profil admin berhasil diperbarui.");
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Nama" {...form.bind("name")} error={errors.name} required />
        <Field label="Email" type="email" {...form.bind("email")} error={errors.email} required />
        <Field label="Nomor Telepon" {...form.bind("phone")} error={errors.phone} />
        <ImageField
          label="Foto Profil"
          round
          value={form.values.photo}
          onChange={(v) => form.set("photo", v)}
          error={errors.photo}
        />
        <div className="sm:col-span-2 pt-2 border-t border-line">
          <PrimaryButton type="submit" loading={saving}>
            <Save size={18} />
            <span>Simpan Perubahan</span>
          </PrimaryButton>
        </div>
      </form>
    </Panel>
  );
}

function PasswordField({ label, error, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Field label={label} type={show ? "text" : "password"} error={error} autoComplete="off" {...props} />
      <button
        type="button"
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        onClick={() => setShow(!show)}
        className="absolute right-3 top-[34px] text-muted hover:text-ink"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function SecurityTab() {
  const { act } = useApp();
  const toast = useToast();
  const form = useForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const { save, saving, errors } = useSave("settings/password", "POST");
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);

  const load = () =>
    api("sessions")
      .then((r) => setSessions(r.sessions))
      .catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await save(form.values, "Password berhasil diubah. Perangkat lain telah dikeluarkan.");
    if (res) {
      form.reset();
      load();
    }
  };

  const revoke = async () => {
    if (confirm === "all") {
      const res = await act("sessions/revoke-others");
      toast(`${res.revoked} perangkat lain dikeluarkan.`);
    } else {
      await act(`sessions/${confirm}`, { method: "DELETE" });
      toast("Perangkat berhasil dikeluarkan.");
    }
    setConfirm(null);
    load();
  };

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel>
        <PanelTitle eyebrow="Keamanan" title="Ubah Password" />
        <form noValidate onSubmit={submit} className="grid gap-4">
          <PasswordField label="Password saat ini" {...form.bind("currentPassword")} error={errors.currentPassword} required />
          <PasswordField label="Password baru" {...form.bind("newPassword")} error={errors.newPassword} placeholder="Minimal 8 karakter, huruf dan angka" required />
          <PasswordField label="Konfirmasi password baru" {...form.bind("confirmPassword")} error={errors.confirmPassword} required />
          <div className="pt-2">
            <PrimaryButton type="submit" loading={saving}>
              <Save size={18} />
              <span>Ubah Password</span>
            </PrimaryButton>
          </div>
        </form>
      </Panel>
      <Panel>
        <div className="mb-3 flex items-start justify-between gap-3">
          <PanelTitle eyebrow="Session" title="Perangkat Login" />
          {sessions && sessions.length > 1 && (
            <GhostButton onClick={() => setConfirm("all")}>
              <LogOut size={16} />
              <span>Keluar semua lainnya</span>
            </GhostButton>
          )}
        </div>
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !sessions ? (
          <LoadingState rows={3} />
        ) : sessions.length ? (
          <ul className="grid gap-3">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-lg border border-line p-3 bg-paper">
                <Smartphone size={20} className="shrink-0 text-maroon" />
                <div className="min-w-0 flex-1">
                  <strong className="block text-ink">
                    {s.device} {s.current && <Badge tone="ok" label="Perangkat ini" />}
                  </strong>
                  <span className="block text-xs text-muted">IP {s.ip} · Aktif terakhir {formatDateTime(s.lastActive)}</span>
                  <span className="block text-xs text-muted">Berlaku sampai {formatDateTime(s.expiresAt)}</span>
                </div>
                {!s.current && (
                  <GhostButton tone="danger" onClick={() => setConfirm(s.id)}>
                    Keluarkan
                  </GhostButton>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Tidak ada session aktif" />
        )}
      </Panel>
      <ConfirmDialog
        open={Boolean(confirm)}
        tone="danger"
        title="Keluarkan Perangkat"
        message={confirm === "all" ? "Keluarkan semua perangkat lain dari akun ini?" : "Keluarkan perangkat ini dari akun Admin?"}
        confirmLabel="Keluarkan"
        onConfirm={revoke}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}

function NotificationTab() {
  const { admin } = useApp();
  const [prefs, setPrefs] = useState(admin.notifications || {});
  const { save, saving } = useSave("settings/notifications");
  const items = [
    ["newReport", "Notifikasi laporan baru", "Tampilkan notifikasi jika ada laporan kost berstatus Baru."],
    ["newOwner", "Notifikasi pemilik baru", "Tampilkan notifikasi jika ada akun pemilik kost baru menunggu verifikasi."],
    ["pendingKost", "Notifikasi kost menunggu verifikasi", "Tampilkan notifikasi jika ada pendaftaran kost baru."],
    ["other", "Notifikasi lainnya", "Pengingat iklan promosi yang akan berakhir dalam 3 hari ke depan."],
  ];

  return (
    <Panel className="max-w-3xl">
      <PanelTitle eyebrow="Notifikasi" title="Pengaturan Notifikasi" />
      <div className="space-y-3">
        {items.map(([k, label, desc]) => (
          <Toggle key={k} label={label} description={desc} checked={Boolean(prefs[k])} onChange={(v) => setPrefs({ ...prefs, [k]: v })} />
        ))}
      </div>
      <div className="mt-5 pt-3 border-t border-line">
        <PrimaryButton onClick={() => save(prefs, "Pengaturan notifikasi disimpan.")} loading={saving}>
          <Save size={18} />
          <span>Simpan Notifikasi</span>
        </PrimaryButton>
      </div>
    </Panel>
  );
}

function AppearanceTab() {
  const { theme, setTheme, collapsed, setSidebarPref } = useApp();
  const toast = useToast();
  const themes = [
    ["light", "Terang", Sun],
    ["dark", "Gelap", Moon],
    ["system", "Ikuti Sistem", Monitor],
  ];

  return (
    <Panel className="max-w-3xl">
      <PanelTitle eyebrow="Tampilan" title="Tema & Tampilan Admin" />
      <p className="mb-2 text-sm font-extrabold text-muted">Tema Antarmuka</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {themes.map(([v, l, Icon]) => (
          <button
            key={v}
            type="button"
            aria-pressed={theme === v}
            onClick={() => {
              setTheme(v);
              toast(`Tema ${l} diterapkan.`);
            }}
            className={`flex items-center gap-2 rounded-xl border p-4 font-bold transition ${
              theme === v ? "border-maroon bg-maroon text-[#EEEAD7] shadow-sm" : "border-line bg-field text-ink hover:bg-track"
            }`}
          >
            <Icon size={18} />
            {l}
          </button>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-line">
        <Toggle
          label="Sidebar mode ciut (Collapsed)"
          description="Pada desktop, sidebar akan menciut hanya menampilkan icon navigasi dengan tooltip."
          checked={collapsed}
          onChange={setSidebarPref}
        />
      </div>
    </Panel>
  );
}

function SystemTab() {
  const { data, admin } = useApp();
  const form = useForm({ ...(data?.system || {}) });
  const { save, saving, errors } = useSave("settings/system");
  const locked = admin?.role !== "super_admin";
  const b = (n) => ({ ...form.bind(n), disabled: locked });

  return (
    <Panel className="max-w-4xl">
      <PanelTitle eyebrow="Sistem" title="Informasi Aplikasi & Website CariKostKita" />
      <p className="mb-4 text-sm text-muted">
        Konfigurasi ini dikonsumsi secara publik oleh Website dan Android.
        {locked && " Hanya Super Admin yang memiliki hak akses untuk mengubah data ini."}
      </p>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save(form.values, "Pengaturan sistem disimpan.");
        }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Nama Aplikasi" {...b("appName")} error={errors.appName} required />
        <Field label="Tagline" {...b("tagline")} />
        <ImageField
          label="Logo Aplikasi"
          value={locked ? data?.system?.logo : form.values.logo}
          onChange={(v) => !locked && form.set("logo", v)}
          error={errors.logo}
        />
        <div className="grid gap-4">
          <Field label="Email Support" type="email" {...b("supportEmail")} error={errors.supportEmail} required />
          <Field label="Nomor Kontak Telepon" {...b("contactPhone")} error={errors.contactPhone} />
        </div>
        <Field label="WhatsApp Hotline" {...b("whatsapp")} error={errors.whatsapp} hint="Format internasional tanpa tanda +, contoh 6281234567890" />
        <Field label="Alamat Kantor" {...b("address")} />
        <Field label="Instagram URL" {...b("instagram")} error={errors.instagram} placeholder="https://instagram.com/carikostkita" />
        <Field label="Facebook URL" {...b("facebook")} error={errors.facebook} placeholder="https://facebook.com/carikostkita" />
        <Field label="TikTok URL" {...b("tiktok")} error={errors.tiktok} placeholder="https://tiktok.com/@carikostkita" />
        <Field label="YouTube URL" {...b("youtube")} error={errors.youtube} placeholder="https://youtube.com/@carikostkita" />
        <Field label="Judul Website (SEO Meta Title)" className="sm:col-span-2" {...b("siteTitle")} error={errors.siteTitle} required />
        <TextArea label="Deskripsi Website (SEO Meta Description)" className="sm:col-span-2" {...b("siteDescription")} />
        {!locked && (
          <div className="sm:col-span-2 pt-2 border-t border-line">
            <PrimaryButton type="submit" loading={saving}>
              <Save size={18} />
              <span>Simpan Pengaturan Sistem</span>
            </PrimaryButton>
          </div>
        )}
      </form>
    </Panel>
  );
}

/** Tab Khusus Super Admin: Manajemen Admin & Role Permission */
function AdminsTab() {
  const { data, act, admin: currentAdmin } = useApp();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const form = useForm({
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "admin",
    password: "",
  });

  const openCreate = () => {
    setEditAdmin(null);
    form.setValues({
      name: "",
      username: "",
      email: "",
      phone: "",
      role: "admin",
      password: "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (adm) => {
    setEditAdmin(adm);
    form.setValues({
      name: adm.name,
      username: adm.username,
      email: adm.email,
      phone: adm.phone || "",
      role: adm.role,
      password: "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (editAdmin) {
        const body = {
          name: form.values.name,
          email: form.values.email,
          phone: form.values.phone,
          role: form.values.role,
        };
        if (form.values.password) body.password = form.values.password;
        await act(`admins/${editAdmin.id}`, { method: "PATCH", body });
        toast(`Data admin ${form.values.name} berhasil diperbarui.`);
      } else {
        await act("admins", { method: "POST", body: form.values });
        toast(`Admin baru ${form.values.name} berhasil ditambahkan.`);
      }
      setModalOpen(false);
    } catch (err) {
      setErrors(err.fields || {});
      toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (adm) => {
    try {
      await act(`admins/${adm.id}`, { method: "PATCH", body: { active: !adm.active } });
      toast(`Akun admin ${adm.name} ${!adm.active ? "diaktifkan" : "dinonaktifkan"}.`);
      setConfirm(null);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const removeAdmin = async (adm) => {
    try {
      await act(`admins/${adm.id}`, { method: "DELETE" });
      toast(`Admin ${adm.name} berhasil dihapus.`);
      setConfirm(null);
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const adminList = data?.admins || [];

  return (
    <div className="space-y-6">
      <Panel>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <PanelTitle eyebrow="Hak Akses" title="Kelola Admin & Akun Tim" />
            <p className="text-xs text-muted mt-1">
              Atur daftar staf pengelola, penetapan role, dan batas kewenangan sistem.
            </p>
          </div>
          <PrimaryButton onClick={openCreate}>
            <Plus size={18} />
            <span>Tambah Admin Baru</span>
          </PrimaryButton>
        </div>

        <DataTable headers={["Admin", "Username / Email", "Role Akses", "Status", "Dibuat", "Aksi"]} minWidth={750}>
          {adminList.map((adm) => (
            <tr key={adm.id}>
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={adm.name} size={32} />
                  <div>
                    <strong className="block text-ink">{adm.name}</strong>
                    <span className="text-xs text-muted font-mono">{adm.phone || "-"}</span>
                  </div>
                </div>
              </Td>
              <Td>
                <div>
                  <span className="font-mono text-xs font-bold text-ink">@{adm.username}</span>
                  <span className="block text-xs text-muted">{adm.email}</span>
                </div>
              </Td>
              <Td>
                <Badge
                  status={adm.role}
                  label={ROLE_LABELS[adm.role] || adm.role}
                  tone={
                    adm.role === "super_admin"
                      ? "brand"
                      : adm.role === "admin"
                      ? "info"
                      : adm.role === "moderator"
                      ? "warning"
                      : "neutral"
                  }
                />
              </Td>
              <Td>
                <Badge status={adm.active ? "Aktif" : "Nonaktif"} />
              </Td>
              <Td className="text-xs">{formatDate(adm.createdAt)}</Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <IconButton label="Edit Data Admin" tone="info" onClick={() => openEdit(adm)}>
                    <Pencil size={16} />
                  </IconButton>
                  {adm.id !== currentAdmin?.id && (
                    <>
                      <IconButton
                        label={adm.active ? "Nonaktifkan" : "Aktifkan"}
                        tone={adm.active ? "warning" : "success"}
                        onClick={() => setConfirm({ type: "toggle", admin: adm })}
                      >
                        <Power size={16} />
                      </IconButton>
                      <IconButton
                        label="Hapus Admin"
                        tone="danger"
                        onClick={() => setConfirm({ type: "delete", admin: adm })}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      </Panel>

      {/* Matriks Kewenangan Role */}
      <Panel>
        <PanelTitle eyebrow="Hak Akses" title="Matriks Kewenangan Role (RBAC)" />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs border border-line rounded-lg overflow-hidden">
            <thead className="bg-track text-muted uppercase font-extrabold">
              <tr>
                <th className="p-2.5">Fitur / Menu</th>
                <th className="p-2.5 text-center">Super Admin</th>
                <th className="p-2.5 text-center">Admin</th>
                <th className="p-2.5 text-center">Moderator</th>
                <th className="p-2.5 text-center">Marketing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                ["Dashboard & Action Center", "✓", "✓", "✓", "✓"],
                ["Manajemen Kost (Review/CRUD)", "✓", "✓", "✓ (Review)", "-"],
                ["Verifikasi Pemilik", "✓", "✓", "✓", "-"],
                ["Manajemen Pengguna", "✓", "✓", "-", "-"],
                ["Laporan Masalah Kost", "✓", "✓", "✓", "-"],
                ["Iklan & Promosi Banner", "✓", "-", "-", "✓"],
                ["Statistik & Analisis", "✓", "✓", "-", "✓ (Iklan)"],
                ["Audit Log Aktivitas", "✓", "-", "-", "-"],
                ["Kelola Admin & Role", "✓", "-", "-", "-"],
                ["Hapus Permanen Data", "✓", "-", "-", "-"],
              ].map(([item, sa, adm, mod, mkt]) => (
                <tr key={item} className="hover:bg-track/30">
                  <td className="p-2.5 font-bold text-ink">{item}</td>
                  <td className="p-2.5 text-center font-bold text-maroon">{sa}</td>
                  <td className="p-2.5 text-center font-semibold text-muted">{adm}</td>
                  <td className="p-2.5 text-center font-semibold text-muted">{mod}</td>
                  <td className="p-2.5 text-center font-semibold text-muted">{mkt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modal Tambah / Edit Admin */}
      <Modal
        open={modalOpen}
        onClose={saving ? undefined : () => setModalOpen(false)}
        title={editAdmin ? `Edit Admin: ${editAdmin.name}` : "Tambah Admin Baru"}
        maxWidth="max-w-md"
      >
        <form onSubmit={submitForm} noValidate className="grid gap-4">
          <Field label="Nama Lengkap" {...form.bind("name")} error={errors.name} required />
          {!editAdmin && (
            <Field label="Username Login" {...form.bind("username")} error={errors.username} required />
          )}
          <Field label="Email" type="email" {...form.bind("email")} error={errors.email} required />
          <Field label="Nomor Telepon" {...form.bind("phone")} error={errors.phone} />
          <SelectField
            label="Role Kewenangan"
            value={form.values.role}
            onChange={(e) => form.set("role", e.target.value)}
            error={errors.role}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]} ({r})
              </option>
            ))}
          </SelectField>
          <Field
            label={editAdmin ? "Password Baru (Opsional)" : "Password Awal"}
            type="password"
            {...form.bind("password")}
            error={errors.password}
            placeholder={editAdmin ? "Kosongkan jika tidak diganti" : "Minimal 8 karakter"}
            required={!editAdmin}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <GhostButton onClick={() => setModalOpen(false)} disabled={saving}>
              Batal
            </GhostButton>
            <PrimaryButton type="submit" loading={saving}>
              <Save size={18} />
              <span>{editAdmin ? "Simpan Perubahan" : "Buat Akun Admin"}</span>
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirm)}
        tone={confirm?.type === "delete" ? "danger" : "warning"}
        title={confirm?.type === "delete" ? "Hapus Akun Admin" : confirm?.admin?.active ? "Nonaktifkan Admin" : "Aktifkan Admin"}
        message={
          confirm &&
          (confirm.type === "delete"
            ? `Apakah Anda yakin ingin menghapus akun admin "${confirm.admin.name}"? Staf ini tidak akan dapat login lagi.`
            : `Apakah Anda yakin ingin ${confirm.admin.active ? "menonaktifkan" : "mengaktifkan"} akses admin "${confirm.admin.name}"?`)
        }
        confirmLabel={confirm?.type === "delete" ? "Hapus Admin" : confirm?.admin?.active ? "Nonaktifkan" : "Aktifkan"}
        onConfirm={() => (confirm.type === "delete" ? removeAdmin(confirm.admin) : toggleActive(confirm.admin))}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
