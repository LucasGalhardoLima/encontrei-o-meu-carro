# Data Model: Landing Page Redesign

**Branch**: `002-landing-page-redesign` | **Date**: 2026-02-20

## Overview

This feature is purely presentational. No database entities, tables, or schemas are created, modified, or queried. All landing page content (copy, stats, icons) is hardcoded in the component source files.

## Entities

None. The landing page does not fetch or persist any data.

## Notes

- Stats values (e.g., "200+ carros") are hardcoded constants in `StatsSection.tsx`. When the catalog grows, these can be updated manually or replaced with a server loader query in a future iteration.
- The existing `HeroSearch` component navigates to `/results?q={query}&mode=browse` which triggers existing data fetching on the results route. No changes to that flow.
