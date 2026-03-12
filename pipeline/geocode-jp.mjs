#!/usr/bin/env node
/**
 * Geocoding script using @geolonia/normalize-japanese-addresses
 * Free, no API key needed, works well with Japanese addresses
 * Usage: node pipeline/geocode-jp.mjs
 */

import fs from "fs";
import path from "path";
import { normalize } from "@geolonia/normalize-japanese-addresses";

const NURSERIES_PATH = path.join(
  process.cwd(),
  "data",
  "municipalities",
  "soja",
  "nurseries.json"
);

async function main() {
  console.log("=== Geocoding nursery addresses (JP) ===\n");

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

    try {
      const result = await normalize(nursery.address);
      console.log(`  Level: ${result.level}`);

      if (result.point && result.point.lat != null && result.point.lng != null) {
        nursery.location = {
          lat: parseFloat(result.point.lat.toFixed(6)),
          lng: parseFloat(result.point.lng.toFixed(6)),
        };
        // Level 3 = town level (大字・町), Level 8 = building level
        // For our purposes, level 3+ is good enough for map display
        nursery.geocoded = result.level >= 3;
        console.log(`  ✅ ${nursery.location.lat}, ${nursery.location.lng} (level ${result.level})`);
        successCount++;
      } else {
        console.log(`  ❌ No coordinates returned`);
        failCount++;
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      failCount++;
    }

    console.log("");
  }

  // Write results
  fs.writeFileSync(
    NURSERIES_PATH,
    JSON.stringify(nurseries, null, 2) + "\n",
    "utf-8"
  );

  console.log("=== Results ===");
  console.log(`Success: ${successCount}/${nurseries.length}`);
  console.log(`Failed:  ${failCount}/${nurseries.length}`);
  console.log(`\nUpdated: ${NURSERIES_PATH}`);
}

main().catch(console.error);
