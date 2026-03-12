#!/usr/bin/env node
/**
 * Geocoding script using OpenStreetMap Nominatim API (free, no API key needed)
 * Rate limit: 1 request per second
 * Usage: node pipeline/geocode.js
 */

const fs = require("fs");
const path = require("path");

const NURSERIES_PATH = path.join(__dirname, "..", "data", "municipalities", "soja", "nurseries.json");

async function geocodeAddress(address) {
  // Try with full address first
  const queries = [
    address,
    // If full address fails, try without prefecture
    address.replace(/^岡山県/, ""),
    // Try with just city + area + number
    address.replace(/^岡山県総社市/, "総社市"),
  ];

  for (const query of queries) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=jp&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "kosodate-map-geocoder/1.0 (childcare map project)",
          "Accept-Language": "ja",
        },
      });

      if (!response.ok) {
        console.error(`  HTTP error: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: data[0].display_name,
        };
      }
    } catch (err) {
      console.error(`  Fetch error: ${err.message}`);
    }
  }

  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== Geocoding nursery addresses ===\n");

  const nurseries = JSON.parse(fs.readFileSync(NURSERIES_PATH, "utf-8"));

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < nurseries.length; i++) {
    const nursery = nurseries[i];
    console.log(`[${i + 1}/${nurseries.length}] ${nursery.name}`);

    if (!nursery.address) {
      console.log("  SKIP: no address\n");
      failCount++;
      continue;
    }

    console.log(`  Address: ${nursery.address}`);

    const result = await geocodeAddress(nursery.address);

    if (result) {
      nursery.location = { lat: result.lat, lng: result.lng };
      nursery.geocoded = true;
      console.log(`  ✅ ${result.lat}, ${result.lng}`);
      console.log(`  Display: ${result.display_name}`);
      successCount++;
    } else {
      console.log(`  ❌ Geocoding failed - keeping approximate coordinates`);
      failCount++;
    }

    console.log("");

    // Rate limit: 1 request per second
    if (i < nurseries.length - 1) {
      await sleep(1100);
    }
  }

  // Write results
  fs.writeFileSync(NURSERIES_PATH, JSON.stringify(nurseries, null, 2) + "\n", "utf-8");

  console.log("=== Results ===");
  console.log(`Success: ${successCount}/${nurseries.length}`);
  console.log(`Failed:  ${failCount}/${nurseries.length}`);
  console.log(`\nUpdated: ${NURSERIES_PATH}`);
}

main().catch(console.error);
