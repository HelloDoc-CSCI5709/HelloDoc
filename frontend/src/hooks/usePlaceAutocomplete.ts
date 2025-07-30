/// <reference types="@types/google.maps" />

import { useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";

// Extend global window with accurate type
declare global {
  interface Window {
    google: typeof globalThis.google;
  }
}


const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ["places"],
});

export const usePlaceAutocomplete = (
  inputId: string,
  onPlaceSelected: (address: string) => void
) => {
  useEffect(() => {
    loader
      .load()
      .then(() => {
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (!input || !window.google) return;

        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ["address"],
          componentRestrictions: { country: "ca" },
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place?.formatted_address) {
            onPlaceSelected(place.formatted_address);
          } else if (place?.name) {
            onPlaceSelected(place.name);
          }
        });
      })
      .catch((err) => {
        console.error("Failed to load Google Maps JS API:", err);
      });
  }, [inputId, onPlaceSelected]);
};
