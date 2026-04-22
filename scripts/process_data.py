#!/usr/bin/env python3
"""
Process shapefiles and Excel data into optimized GeoJSON for the dashboard.
Creates:
- countries.json: Country list with summary statistics
- Per-country GeoJSON files with district geometries
"""

import geopandas as gpd
import pandas as pd
import json
import os
from pathlib import Path

# Paths
DATA_DIR = Path("/Users/anademenezes/Documents/tripleburden/data")
OUTPUT_DIR = Path("/Users/anademenezes/Documents/tripleburden/web-app/public/data")
SHAPEFILE = DATA_DIR / "Shapefiles" / "GAD_ADM2.shp"
SHAPEFILE_TB = DATA_DIR / "Shapefiles" / "GAD_ADM2_TB.shp"
EXCEL_FILE = DATA_DIR / "TripleBurden_Pilot_Nov18_DataMetaData.xls"

def main():
    print("Loading shapefile...")
    gdf = gpd.read_file(SHAPEFILE)
    print(f"Loaded {len(gdf)} districts")

    # Merge in reg1 (WB region), incgrp (income group), impwat (improved water %)
    # from the companion 2_TB attribute table. Geometry is byte-identical, so we
    # join by index (row order is preserved across both DBFs).
    print("Loading 2_TB companion shapefile (reg1, incgrp, impwat)...")
    gdf_tb = gpd.read_file(SHAPEFILE_TB)
    assert len(gdf) == len(gdf_tb), (
        f"Row count mismatch: primary={len(gdf)}, 2_TB={len(gdf_tb)}. "
        "Index-join only valid when both DBFs share the same record order."
    )
    # Assign per-column to preserve each source dtype (bulk .values assignment
    # coerces mixed string + numeric into object dtype).
    gdf["reg1"] = gdf_tb["reg1"].values
    gdf["incgrp"] = gdf_tb["incgrp"].values
    gdf["impwat"] = pd.to_numeric(gdf_tb["impwat"], errors="coerce").values
    print(f"Merged 3 new columns from 2_TB DBF")
    
    # Simplify geometries for web performance (reduce file size by ~80%)
    print("Simplifying geometries...")
    gdf['geometry'] = gdf['geometry'].simplify(tolerance=0.01, preserve_topology=True)
    
    # Get unique ISO3 codes and find the main country name (most districts)
    # This avoids duplicate keys from territories like French Guiana under FRA
    country_names = {}
    for iso3 in gdf['iso3'].dropna().unique():
        iso_data = gdf[gdf['iso3'] == iso3]
        # Get the country name with the most districts
        name_counts = iso_data['nam0'].value_counts()
        if len(name_counts) > 0:
            country_names[iso3] = name_counts.index[0]
    
    countries_list = sorted(country_names.items(), key=lambda x: x[1])  # Sort by name
    print(f"Found {len(countries_list)} unique country codes")
    
    # Create output directories
    districts_dir = OUTPUT_DIR / "districts"
    districts_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate country summary statistics
    country_stats = []
    
    for iso3, country_name in countries_list:
        
        # Filter districts for this country
        country_gdf = gdf[gdf['iso3'] == iso3].copy()
        
        if len(country_gdf) == 0:
            continue
            
        # Calculate statistics
        total_pop = country_gdf['popdist'].sum()
        
        # Triple burden counts (using flood risk)
        tb_fld_counts = country_gdf['tb_fld'].value_counts().to_dict()
        tb_wtrstr_counts = country_gdf['tb_wtrstr'].value_counts().to_dict()
        
        # Population affected by triple burden
        pop_tb_fld = country_gdf[country_gdf['tb_fld'] == 3]['popdist'].sum()
        pop_tb_wtrstr = country_gdf[country_gdf['tb_wtrstr'] == 3]['popdist'].sum()
        
        # Region and income group are country-level (invariant per iso3) —
        # pick from the first district row.
        region = country_gdf['reg1'].iloc[0] if 'reg1' in country_gdf.columns else None
        income_group = country_gdf['incgrp'].iloc[0] if 'incgrp' in country_gdf.columns else None

        stats = {
            "iso3": iso3,
            "name": country_name,
            "region": region if pd.notna(region) else None,
            "income_group": income_group if pd.notna(income_group) else None,
            "districts": len(country_gdf),
            "population": float(total_pop) if pd.notna(total_pop) else 0,
            "pop_triple_burden_flood": float(pop_tb_fld) if pd.notna(pop_tb_fld) else 0,
            "pop_triple_burden_water_stress": float(pop_tb_wtrstr) if pd.notna(pop_tb_wtrstr) else 0,
            "burden_distribution_flood": {str(k): int(v) for k, v in tb_fld_counts.items() if pd.notna(k)},
            "burden_distribution_water_stress": {str(k): int(v) for k, v in tb_wtrstr_counts.items() if pd.notna(k)},
        }
        country_stats.append(stats)
        
        # Save country GeoJSON (only if it has data for triple burden)
        if len(country_gdf) > 0:
            # Select relevant columns
            cols_to_keep = ['mundis_id', 'nam1', 'nam2', 'popdist', 'shrurb', 'd_urb',
                           'p215ln', 'p365ln', 'p685ln', 'd_pov',
                           'shpopfld', 'd_fld', 'bws_cat', 'd_wtrstr',
                           'impsan', 'sewlat', 'd_lowsan', 'impwat',
                           'reg1', 'incgrp',
                           'tb_fld', 'tb_wtrstr', 'geometry']
            cols_available = [c for c in cols_to_keep if c in country_gdf.columns]
            country_gdf = country_gdf[cols_available]
            
            # Filter out invalid geometries (null, empty, or invalid)
            valid_mask = country_gdf['geometry'].notna() & ~country_gdf['geometry'].is_empty & country_gdf['geometry'].is_valid
            invalid_count = (~valid_mask).sum()
            if invalid_count > 0:
                print(f"    Filtering out {invalid_count} invalid geometries for {iso3}")
            country_gdf = country_gdf[valid_mask]
            
            # Convert to GeoJSON
            geojson_path = districts_dir / f"{iso3.lower()}.json"
            country_gdf.to_file(geojson_path, driver='GeoJSON')
            print(f"  Saved {iso3}: {len(country_gdf)} districts")
    
    # Save countries index
    countries_path = OUTPUT_DIR / "countries.json"
    with open(countries_path, 'w') as f:
        json.dump(country_stats, f, indent=2)
    print(f"\nSaved countries index: {len(country_stats)} countries")
    
    print("\nData processing complete!")

if __name__ == "__main__":
    main()
