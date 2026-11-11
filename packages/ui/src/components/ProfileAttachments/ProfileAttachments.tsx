import { useState } from "react";
import type { ChangeEvent } from "react";
import type { ProfileDocument } from "@healthcare-platform/types";
import "./ProfileAttachments.css";

interface ProfileAttachmentsProps {
  avatar?: string;
  document?: ProfileDocument;
  onAvatarChange: (avatar: string | undefined) => void;
  onDocumentChange: (document: ProfileDocument | undefined) => void;
}

const maxFileSize = 512 * 1024;
const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const allowedDocumentTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read the selected file."));
    };
    reader.onerror = () =>
      reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

export function ProfileAttachments({
  avatar,
  document,
  onAvatarChange,
  onDocumentChange,
}: ProfileAttachmentsProps) {
  const [error, setError] = useState("");

  const selectAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!allowedImageTypes.has(file.type)) {
      setError("Choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > maxFileSize) {
      setError("Profile photos must be 512 KB or smaller.");
      return;
    }

    try {
      onAvatarChange(await readFile(file));
      setError("");
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : "Could not read the selected photo.",
      );
    }
  };

  const selectDocument = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (
      !allowedDocumentTypes.has(file.type) &&
      !["doc", "docx", "pdf", "txt"].includes(extension ?? "")
    ) {
      setError("Choose a PDF, DOC, DOCX, or TXT document.");
      return;
    }
    if (file.size > maxFileSize) {
      setError("Documents must be 512 KB or smaller.");
      return;
    }

    try {
      onDocumentChange({
        name: file.name,
        type: file.type || "application/octet-stream",
        dataUrl: await readFile(file),
        size: file.size,
      });
      setError("");
    } catch (readError) {
      setError(
        readError instanceof Error
          ? readError.message
          : "Could not read the selected document.",
      );
    }
  };

  return (
    <fieldset className="profile-attachments">
      <legend>Photo and document</legend>
      <label>
        Profile photo
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => void selectAvatar(event)}
        />
      </label>
      {avatar && (
        <div className="profile-attachments__preview">
          <img src={avatar} alt="Profile photo preview" />
          <button type="button" onClick={() => onAvatarChange(undefined)}>
            Remove photo
          </button>
        </div>
      )}
      <label>
        Document
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(event) => void selectDocument(event)}
        />
      </label>
      {document && (
        <div className="profile-attachments__document">
          <a href={document.dataUrl} download={document.name}>
            {document.name}
          </a>
          <button type="button" onClick={() => onDocumentChange(undefined)}>
            Remove document
          </button>
        </div>
      )}
      {error && (
        <p className="profile-attachments__error" role="alert">
          {error}
        </p>
      )}
      <p className="profile-attachments__hint">
        Photo and document files must each be 512 KB or smaller.
      </p>
    </fieldset>
  );
}
