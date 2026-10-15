"use client";

import { useRouter } from "next/navigation";
import { SubmissionResults } from "@/app/components/submission-results";
import type { SubmissionSuccessResponse } from "@/lib/submissions/types";
import { useRef, useState, type FormEvent } from "react";

function Icon({ camera = false }: { camera?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {camera ? (
        <>
          <path d="M9 4h6l2 3h4v13H3V7h4z" />
          <circle cx="12" cy="13" r="4" />
        </>
      ) : (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [postcode, setPostcode] = useState("");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [result, setResult] = useState<SubmissionSuccessResponse | null>(null);
  const version = useRef(0);
  const edits = useRef(0);

  async function choosePhoto(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setPhotoMessage("Choose a JPG, PNG or WebP under 5 MB.");
      return;
    }
    const request = ++version.current;
    const edit = edits.current;
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setAnalysing(true);
    setPhotoMessage("Identifying your item…");
    setMessage("");
    setResult(null);
    try {
      const body = new FormData();
      body.set("photo", file);
      const response = await fetch("/api/analyse", { method: "POST", body });
      const data = await response.json();
      if (request !== version.current) return;
      if (!response.ok) throw new Error(data.error);
      if (data.status === "manual") {
        setPhotoMessage(data.message);
        return;
      }
      if (edits.current === edit) setDescription(data.description);
      setPhotoMessage(
        data.catalogueMatch ? `Catalogue item: ${data.catalogueMatch.title}. Please check this fits your photo.` : (data.catalogueWarning || "No catalogue match yet. Check the description and use a specific item name."),
      );
    } catch (error) {
      if (request === version.current) {
        setPhotoMessage(
          error instanceof Error
            ? error.message
            : "Please describe your item below.",
        );
      }
    } finally {
      if (request === version.current) setAnalysing(false);
    }
  }

  function locate() {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Enter your postcode instead. Location is unavailable.",
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoordinates({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        });
        setPostcode("");
        setLocationMessage("Current location selected.");
        setLocating(false);
      },
      () => {
        setLocationMessage(
          "Couldn't access your location. Enter your postcode instead.",
        );
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false },
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setResult(null);
    try {
      const body = new FormData();
      body.set("description", description.trim());
      body.set("postcode", postcode);
      if (coordinates) body.set("coordinates", JSON.stringify(coordinates));
      if (photo) body.set("photo", photo);
      const response = await fetch("/api/submissions", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data as SubmissionSuccessResponse);
      try { sessionStorage.setItem("unplug-results", JSON.stringify(data)); router.push("/results"); } catch { /* Keep inline results if browser storage is unavailable. */ }
      if (data.status === "results_ready") {
        setMessage("Here are your next steps, ordered by pathway.");
      } else {
        setMessage("Submission saved, but we need a clearer description.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <h1 className="brand-heading">
          <a href="/" className="wordmark" aria-label="Unplug home">Unplug</a>
        </h1>
      </header>
      <main id="main" className="landing">
        <section className="form-card" aria-labelledby="form-heading">
          <div className="card-top">
            <span>LET’S START WITH YOUR ITEM</span>
            <span className="pill">About 1 min</span>
          </div>
          <h2 id="form-heading">What have you got?</h2>
          <p className="card-description">
            Does it have a plug? Most people think e-waste is just for computers.
            Any electric item can find a new home or use.
          </p>
          <form onSubmit={submit}>
            <label className="photo-upload">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                aria-label="Take or upload a photo"
                disabled={sending}
                onChange={(e) => {
                  void choosePhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              {preview ? (
                <img src={preview} alt="Your selected item" />
              ) : (
                <span className="camera-circle">
                  <Icon camera />
                </span>
              )}
              <span>
                <strong>
                  {preview ? "Change your photo" : "Take or upload a photo"}
                </strong>
                <small>
                  {preview
                    ? photo?.name
                    : "Snap it. We’ll help identify it."}
                </small>
              </span>
              <span className="plus">+</span>
            </label>
            <p className="help">
              JPG, PNG or WebP · Up to 5 MB. Photos are sent to Google Gemini
              for identification.
            </p>
            <p className="feedback" role="status">{photoMessage}</p>
            <label className="field-label" htmlFor="description">
              Your item <span>— or just describe it</span>
            </label>
            <textarea
              id="description"
              placeholder="e.g. A toaster that’s stopped working…"
              required
              maxLength={1000}
              value={description}
              disabled={sending}
              onChange={(e) => {
                edits.current++;
                setDescription(e.target.value);
              }}
            />
            <div className="location-heading">
              <label className="field-label" htmlFor="postcode">
                Where are you?
              </label>
              <button
                type="button"
                onClick={locate}
                disabled={locating || sending}
              >
                {locating ? "Locating…" : "⌖ Use my location"}
              </button>
            </div>
            <input
              id="postcode"
              className="postcode"
              placeholder={
                coordinates ? "Current location selected" : "NZ postcode, e.g. 1010"
              }
              autoComplete="postal-code"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              required={!coordinates}
              value={postcode}
              disabled={sending}
              onChange={(e) => {
                setPostcode(e.target.value);
                setCoordinates(null);
                setLocationMessage("");
              }}
            />
            <p className="help">
              So we can look for options near you. Your location is only shared
              when you press Go.
            </p>
            <p className="feedback" role="status">{locationMessage}</p>
            <button
              className="go-button"
              disabled={analysing || locating || sending}
              type="submit"
            >
              <span>
                {sending
                  ? "Finding options…"
                  : analysing
                    ? "Identifying photo…"
                    : "Go"}
              </span>
              <Icon />
            </button>
            <p className="feedback submission" role="status">{message}</p>
            {result ? <SubmissionResults result={result} /> : null}
          </form>
          <div className="prototype-note">
            ● Demo catalogue (5 items, 3 businesses). Live civic imports can
            replace seed data later.
          </div>
        </section>
      </main>
      <footer>
        <span>Small actions. Longer lives for our stuff.</span>
        <span>Built in Auckland, for Auckland ↗</span>
      </footer>
    </div>
  );
}
