'use client'

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import debounce from "lodash.debounce";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icons
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
    control: any;
}

interface NominatimPlace {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        road?: string;
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        postcode?: string;
    };
}

const StyledPopupMapAutocomplete: React.FC<Props> = ({ control }) => {
    const form = useFormContext(); // access all form fields
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<NominatimPlace[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounced address search
    const fetchAddresses = useCallback(
        debounce(async (q: string) => {
            if (!q || q.length < 3) return;

            let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const { latitude, longitude } = pos.coords;
                    url += `&viewbox=${longitude - 0.5},${latitude + 0.5},${longitude + 0.5},${latitude - 0.5}&bounded=1`;
                });
            }

            const res = await fetch(url, {
                headers: { "User-Agent": "YourAppName/1.0 (test@example.com)" },
            });
            const data: NominatimPlace[] = await res.json();
            setResults(data);
        }, 400),
        []
    );

    useEffect(() => {
        fetchAddresses(query);
    }, [query, fetchAddresses]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setResults([]);
                setShowMap(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (place: NominatimPlace) => {
        const { road, city, town, village, state, postcode } = place.address || {};

        form.setValue("address1", road || place.display_name || "");
        form.setValue("city", city || town || village || "");
        form.setValue("state", state || "");
        form.setValue("postalCode", postcode || "");

        setSelectedLocation([parseFloat(place.lat), parseFloat(place.lon)]);
        setShowMap(true);
        setResults([]);

        // Blur input to avoid highlight bug
        setTimeout(() => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!results.length) return;

        if (e.key === "ArrowDown") setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
        else if (e.key === "ArrowUp") setActiveIndex((prev) => Math.max(prev - 1, 0));
        else if (e.key === "Enter") {
            if (activeIndex >= 0) handleSelect(results[activeIndex]);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full flex flex-col gap-2">
            {/* Street input with autocomplete */}
            <Controller
                control={control}
                name="address1"
                render={({ field }) => (
                    <div className="relative w-full">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Street</label>
                        <input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                field.onChange(e.target.value);
                                setShowMap(false);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Start typing your address..."
                            className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {results.length > 0 && (
                            <ul className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                                {results.map((r, index) => (
                                    <li
                                        key={r.place_id}
                                        onClick={() => handleSelect(r)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={`p-2 cursor-pointer truncate ${index === activeIndex ? "bg-blue-100" : "hover:bg-gray-100"}`}
                                    >
                                        {r.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            />

            {/* Other address fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Controller
                    control={control}
                    name="city"
                    render={({ field }) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                            <input {...field} placeholder="City" className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name="state"
                    render={({ field }) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                            <input {...field} placeholder="State" className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name="postalCode"
                    render={({ field }) => (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Postal Code</label>
                            <input {...field} placeholder="Postal Code" className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    )}
                />
            </div>

            {/* Map */}
            {showMap && selectedLocation && (
                <div className="mt-2 border rounded-md shadow-lg w-full h-48">
                    <MapContainer center={selectedLocation} zoom={15} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker position={selectedLocation}></Marker>
                    </MapContainer>
                </div>
            )}
        </div>
    );
};

export default StyledPopupMapAutocomplete;
