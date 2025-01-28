"use client";

import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FaMapMarkerAlt } from "react-icons/fa";

const MapView = ({ assets }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Map View</h2>
      <Map
        initialViewState={{
          longitude: 18.068581, // Center the map on Stockholm, Sweden
          latitude: 59.329323,
          zoom: 12,
        }}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
        }}
        mapStyle="mapbox://styles/mapbox/dark-v10" // Predefined Dark Style
        mapboxAccessToken={
          "pk.eyJ1IjoibGV3bGkiLCJhIjoiY202OTlzNTZ3MDl6dTJqc2VsaTR6aXI5aiJ9.SVlhU64-v-CBbqZDCNwygw"
        }
      >
        {/* Add markers for each asset */}
        {assets.map((asset) => (
          <Marker
            key={asset.id}
            longitude={asset.location.lng}
            latitude={asset.location.lat}
            anchor="center"
          >
            <div
              className="text-blue-500 text-2xl cursor-pointer animate-bounce"
              onClick={() => setSelectedAsset(asset)}
              title={asset.name}
            >
              <FaMapMarkerAlt className="drop-shadow-lg" />
            </div>
          </Marker>
        ))}

        {/* Show popup when a marker is clicked */}
        {selectedAsset && (
          <Popup
            longitude={selectedAsset.location.lng}
            latitude={selectedAsset.location.lat}
            onClose={() => setSelectedAsset(null)}
            closeOnClick={false}
            offsetTop={-10}
            className="rounded-lg shadow-lg"
          >
            <div className="text-sm p-2">
              <h3 className="font-bold text-blue-400 text-lg">
                {selectedAsset.name}
              </h3>
              <p className="text-gray-300 text-sm">
                <strong>Address:</strong> {selectedAsset.address}
              </p>
              <p className="text-gray-300 text-sm">
                <strong>Carbon Processed:</strong>{" "}
                {selectedAsset.carbonProcessed} tons
              </p>
              <p
                className={`font-medium text-sm ${selectedAsset.status === "Active"
                    ? "text-green-400"
                    : "text-red-400"
                  }`}
              >
                <strong>Status:</strong> {selectedAsset.status}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapView;
