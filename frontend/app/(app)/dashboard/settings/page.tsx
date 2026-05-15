"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  LogOut,
  ChevronRight,
  Globe,
  Download,
  Trash2,
} from "lucide-react";
import {
  NeoCard,
  NeoButton,
  NeoInput,
  NeoAvatar,
  NeoModal,
  NeoSelect,
} from "@/components/neo-ui";
import { useAuth } from "@/lib/auth-context";
import { cn, getErrorMessage } from "@/lib/utils";
import { apiDelete, apiGet, apiPut } from "@/lib/api";
import { currencyOptions, formatCurrency, useCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { isStrongPassword } from "@/lib/validation";
import { strings } from "@/locales/en";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
        {title}
      </h3>
      <NeoCard shadow="md">{children}</NeoCard>
    </div>
  );
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

function SettingsItem({
  icon,
  label,
  description,
  action,
  onClick,
  danger,
}: SettingsItemProps) {
  const content = (
    <div
      className={cn(
        "p-4 flex items-center gap-4 transition-colors border-b-2 border-black last:border-b-0",
        onClick && "cursor-pointer hover:bg-gray-50",
        danger && "hover:bg-red-50",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center shrink-0",
          danger ? "bg-destructive" : "bg-primary",
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium", danger && "text-red-600")}>{label}</p>
        {description && (
          <p className="text-sm text-gray-500 truncate">{description}</p>
        )}
      </div>
      {action ||
        (onClick && <ChevronRight className="w-5 h-5 text-gray-400" />)}
    </div>
  );

  return content;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, refreshProfile } = useAuth();
  const { symbol, setSymbol } = useCurrency();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const [friendsCount, setFriendsCount] = useState(0);
  const [expensesCount, setExpensesCount] = useState(0);
  const [totalSplit, setTotalSplit] = useState(0);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [balances, expenses] = await Promise.all([
          apiGet("/balances/friends"),
          apiGet("/expenses/user"),
        ]);
        setFriendsCount((balances || []).length);
        setExpensesCount((expenses || []).length);
        setTotalSplit(
          (expenses || []).reduce((sum: number, e: any) => sum + e.amount, 0),
        );
      } catch (error) {
        toast({
          title: strings.settings.toasts.loadStatsFail,
          description: getErrorMessage(
            error,
            strings.settings.toasts.loadFailFallback,
          ),
          variant: "destructive",
        });
      }
    };

    loadStats();
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: strings.settings.toasts.signedOutTitle,
      description: strings.settings.toasts.signedOutDescription,
    });
    router.push("/login");
  };

  const handleSaveProfile = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setProfileError(strings.settings.errors.nameMissing);
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError("");
      await apiPut("/auth/profile", { name: trimmed });
      await refreshProfile();
      setShowEditProfile(false);
      toast({
        title: strings.settings.toasts.profileUpdatedTitle,
        description: strings.settings.toasts.profileUpdatedDescription,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        strings.settings.toasts.updateProfileFailFallback,
      );
      setProfileError(message);
      toast({
        title: strings.settings.toasts.updateFailedTitle,
        description: message,
        variant: "destructive",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordError(strings.settings.errors.passwordFieldsMissing);
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setPasswordError(strings.settings.errors.passwordWeak);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(strings.settings.errors.passwordMismatch);
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordError("");
      await apiPut("/auth/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
      toast({
        title: strings.settings.toasts.passwordUpdatedTitle,
        description: strings.settings.toasts.passwordUpdatedDescription,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        strings.settings.toasts.updatePasswordFailFallback,
      );
      setPasswordError(message);
      toast({
        title: strings.settings.toasts.updateFailedTitle,
        description: message,
        variant: "destructive",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const exportPayload = await apiGet("/auth/export");
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `khaata-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast({
        title: strings.settings.toasts.exportReadyTitle,
        description: strings.settings.toasts.exportReadyDescription,
      });
    } catch (error) {
      toast({
        title: strings.settings.toasts.exportFailedTitle,
        description: getErrorMessage(
          error,
          strings.settings.toasts.loadFailFallback,
        ),
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDeleteText.trim().toUpperCase() !== "DELETE") return;
    try {
      setDeleting(true);
      await apiDelete("/auth/account");
      logout();
      toast({
        title: strings.settings.toasts.accountDeletedTitle,
        description: strings.settings.toasts.accountDeletedDescription,
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: strings.settings.toasts.deleteFailedTitle,
        description: getErrorMessage(
          error,
          strings.settings.toasts.loadFailFallback,
        ),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const selectedCurrency =
    currencyOptions.find((option) => option.value === symbol) ||
    currencyOptions[0];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {strings.settings.title}
        </h1>
        <p className="text-gray-600">{strings.settings.subtitle}</p>
      </div>

      {/* Profile Section */}
      <NeoCard shadow="lg">
        <div className="p-6 bg-primary border-b-2 border-black">
          <div className="flex items-center gap-4">
            <div className="relative">
              <NeoAvatar name={user?.name || "User"} size="lg" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name || "User"}</h2>
              <p className="text-sm text-gray-700">{user?.email || ""}</p>
            </div>
          </div>
        </div>
        <div className="p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{friendsCount}</p>
            <p className="text-xs text-gray-500">
              {strings.settings.profile.labelSquad}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold">{expensesCount}</p>
            <p className="text-xs text-gray-500">
              {strings.settings.profile.labelSplits}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatCurrency(totalSplit, symbol, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-gray-500">
              {strings.settings.profile.labelTotal}
            </p>
          </div>
        </div>
      </NeoCard>

      {/* Account Settings */}
      <SettingsSection title={strings.settings.sections.account}>
        <SettingsItem
          icon={<User className="w-5 h-5" />}
          label={strings.settings.items.editProfile.label}
          description={strings.settings.items.editProfile.description}
          onClick={() => setShowEditProfile(true)}
        />

        <SettingsItem
          icon={<Lock className="w-5 h-5" />}
          label={strings.settings.items.changePassword.label}
          description={strings.settings.items.changePassword.description}
          onClick={() => setShowChangePassword(true)}
        />
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title={strings.settings.sections.preferences}>
        <SettingsItem
          icon={<Globe className="w-5 h-5" />}
          label={strings.settings.items.currency.label}
          description={selectedCurrency.label}
          action={
            <NeoSelect
              options={currencyOptions}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-32"
            />
          }
        />
      </SettingsSection>

      {/* Data & Privacy */}
      <SettingsSection title={strings.settings.sections.dataPrivacy}>
        <SettingsItem
          icon={<Download className="w-5 h-5" />}
          label={strings.settings.items.export.label}
          description={strings.settings.items.export.description}
          onClick={exporting ? undefined : handleExportData}
        />
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title={strings.settings.sections.danger}>
        <SettingsItem
          icon={<LogOut className="w-5 h-5" />}
          label={strings.settings.items.logout.label}
          onClick={handleLogout}
        />
        <SettingsItem
          icon={<Trash2 className="w-5 h-5" />}
          label={strings.settings.items.delete.label}
          description={strings.settings.items.delete.description}
          onClick={() => setShowDeleteAccount(true)}
          danger
        />
      </SettingsSection>

      {/* Edit Profile Modal */}
      <NeoModal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        title={strings.settings.modals.editProfile.title}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <NeoAvatar name={name} size="lg" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.settings.modals.editProfile.nameLabel}
            </label>
            <NeoInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={strings.settings.modals.editProfile.namePlaceholder}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.settings.modals.editProfile.emailLabel}
            </label>
            <NeoInput
              type="email"
              value={email}
              disabled
              placeholder={strings.settings.modals.editProfile.emailPlaceholder}
            />
          </div>

          {profileError && (
            <p className="text-sm text-red-600">{profileError}</p>
          )}

          <div className="flex gap-3 pt-4 border-t-2 border-black">
            <NeoButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowEditProfile(false)}
            >
              {strings.settings.modals.editProfile.cancel}
            </NeoButton>
            <NeoButton
              variant="accent"
              className="flex-1"
              onClick={handleSaveProfile}
              disabled={profileSaving}
            >
              {profileSaving
                ? strings.settings.modals.editProfile.saving
                : strings.settings.modals.editProfile.save}
            </NeoButton>
          </div>
        </div>
      </NeoModal>

      {/* Change Password Modal */}
      <NeoModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title={strings.settings.modals.changePassword.title}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.settings.modals.changePassword.currentLabel}
            </label>
            <NeoInput
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={
                strings.settings.modals.changePassword.currentPlaceholder
              }
              aria-invalid={!!passwordError}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.settings.modals.changePassword.newLabel}
            </label>
            <NeoInput
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={
                strings.settings.modals.changePassword.newPlaceholder
              }
              minLength={8}
              pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
              title={strings.common.passwordHint}
              aria-invalid={!!passwordError}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.settings.modals.changePassword.confirmLabel}
            </label>
            <NeoInput
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={
                strings.settings.modals.changePassword.confirmPlaceholder
              }
              minLength={8}
              aria-invalid={!!passwordError}
            />
          </div>

          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}

          <div className="flex gap-3 pt-4 border-t-2 border-black">
            <NeoButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowChangePassword(false)}
            >
              {strings.settings.modals.changePassword.cancel}
            </NeoButton>
            <NeoButton
              variant="primary"
              className="flex-1"
              onClick={handleChangePassword}
              disabled={passwordSaving}
            >
              {passwordSaving
                ? strings.settings.modals.changePassword.updating
                : strings.settings.modals.changePassword.update}
            </NeoButton>
          </div>
        </div>
      </NeoModal>

      {/* Delete Account Modal */}
      <NeoModal
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        title={strings.settings.modals.deleteAccount.title}
      >
        <div className="space-y-4">
          <div className="p-4 bg-destructive border-2 border-black rounded-md">
            <p className="font-bold text-center">
              {strings.settings.modals.deleteAccount.warningTitle}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            {strings.settings.modals.deleteAccount.warningCopy}
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.settings.modals.deleteAccount.confirmLabel}
            </label>
            <NeoInput
              placeholder={
                strings.settings.modals.deleteAccount.confirmPlaceholder
              }
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4 border-t-2 border-black">
            <NeoButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowDeleteAccount(false)}
            >
              {strings.settings.modals.deleteAccount.cancel}
            </NeoButton>
            <NeoButton
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteAccount}
              disabled={
                deleting ||
                confirmDeleteText.trim().toUpperCase() !==
                  strings.settings.modals.deleteAccount.confirmText
              }
            >
              <Trash2 className="w-4 h-4" />
              {deleting
                ? strings.settings.modals.deleteAccount.deleting
                : strings.settings.modals.deleteAccount.action}
            </NeoButton>
          </div>
        </div>
      </NeoModal>
    </div>
  );
}
