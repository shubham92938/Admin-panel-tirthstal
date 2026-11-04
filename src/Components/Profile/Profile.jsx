import { useEffect, useState } from "react";
import { errorDetails } from "../../services/api";
import {
  changedProfileFields,
  changePassword,
  getProfile,
  updateProfile,
} from "../../services/profile";
import "./Profile.css";

const EMPTY_PROFILE = { name: "", language: "en", phone: "", city: "", bio: "" };
const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirmPassword: "" };

function RequestError({ error }) {
  if (!error) return null;
  return (
    <div className="profile-alert profile-alert-error" role="alert">
      <strong>{error.message}</strong>
      {error.fields.length > 0 && <ul>{error.fields.map((item, index) => <li key={`${item.field}-${index}`}>{item.field}: {item.message}</li>)}</ul>}
    </div>
  );
}

export default function Profile() {
  const [original, setOriginal] = useState(EMPTY_PROFILE);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    let active = true;
    getProfile()
      .then((user) => {
        if (!active) return;
        const editable = {
          name: user.name || "",
          language: user.language || "en",
          phone: user.phone || "",
          city: user.city || "",
          bio: user.bio || "",
        };
        setOriginal(editable);
        setProfile(editable);
      })
      .catch((error) => active && setProfileError(errorDetails(error)))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setProfileSuccess("");
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    const changes = changedProfileFields(original, profile);
    setProfileError(null);
    setProfileSuccess("");

    if (!Object.keys(changes).length) {
      setProfileSuccess("No profile fields have changed.");
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await updateProfile(changes);
      const next = { ...profile, ...Object.fromEntries(Object.keys(changes).map((key) => [key, updated?.[key] ?? changes[key]])) };
      setProfile(next);
      setOriginal(next);
      setProfileSuccess("Profile updated successfully.");
    } catch (error) {
      setProfileError(errorDetails(error));
    } finally {
      setProfileSaving(false);
    }
  };

  const updatePasswordField = (event) => {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
    setPasswordError(null);
    setPasswordSuccess("");
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError({ message: "New password and confirmation do not match.", fields: [] });
      return;
    }
    if (passwords.currentPassword === passwords.newPassword) {
      setPasswordError({ message: "New password must be different from the current password.", fields: [] });
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords(EMPTY_PASSWORDS);
      setPasswordSuccess(response.message || "Password changed successfully.");
    } catch (error) {
      setPasswordError(errorDetails(error));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="profile-header">
        <span>Admin settings</span>
        <h1>Your profile</h1>
        <p>Manage your personal details and account security.</p>
      </header>

      <div className="profile-layout">
        <section className="profile-card">
          <div className="profile-card-heading"><div><h2>Profile details</h2><p>Only fields you change are sent to the server.</p></div></div>
          {loading ? <p className="profile-loading">Loading profile…</p> : (
            <form onSubmit={submitProfile}>
              <div className="profile-card-body">
                <RequestError error={profileError} />
                {profileSuccess && <div className="profile-alert profile-alert-success" role="status">{profileSuccess}</div>}
                <div className="profile-grid">
                  <label><span>Name</span><input name="name" value={profile.name} onChange={updateField} minLength={1} maxLength={50} required /></label>
                  <label><span>Language</span><select name="language" value={profile.language} onChange={updateField}><option value="en">English</option><option value="hi">Hindi</option><option value="mr">Marathi</option><option value="gu">Gujarati</option></select></label>
                  <label><span>Phone</span><input name="phone" type="tel" value={profile.phone} onChange={updateField} placeholder="+91 98765 43210" /><small>Leave empty to clear your phone number.</small></label>
                  <label><span>City</span><input name="city" value={profile.city} onChange={updateField} maxLength={100} /></label>
                  <label className="profile-full"><span>Bio</span><textarea name="bio" value={profile.bio} onChange={updateField} maxLength={500} rows={5} /><small>{profile.bio.length}/500 characters</small></label>
                </div>
              </div>
              <footer className="profile-card-footer"><button type="submit" disabled={profileSaving}>{profileSaving ? "Saving…" : "Save profile"}</button></footer>
            </form>
          )}
        </section>

        <section className="profile-card">
          <div className="profile-card-heading"><div><h2>Change password</h2><p>Use a new password between 6 and 72 characters.</p></div></div>
          <form onSubmit={submitPassword}>
            <div className="profile-card-body">
              <RequestError error={passwordError} />
              {passwordSuccess && <div className="profile-alert profile-alert-success" role="status">{passwordSuccess}</div>}
              <div className="profile-password-fields">
                <label><span>Current password</span><input name="currentPassword" type="password" value={passwords.currentPassword} onChange={updatePasswordField} autoComplete="current-password" required /></label>
                <label><span>New password</span><input name="newPassword" type="password" value={passwords.newPassword} onChange={updatePasswordField} autoComplete="new-password" minLength={6} maxLength={72} required /></label>
                <label><span>Confirm new password</span><input name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={updatePasswordField} autoComplete="new-password" minLength={6} maxLength={72} required /></label>
              </div>
              <p className="profile-security-note">Passwords are sent only to the change-password endpoint and are never saved in this panel.</p>
            </div>
            <footer className="profile-card-footer"><button type="submit" disabled={passwordSaving}>{passwordSaving ? "Changing…" : "Change password"}</button></footer>
          </form>
        </section>
      </div>
    </div>
  );
}
