Flight Paths assets

Three.js 0.170.0: https://threejs.org/ (MIT; see vendor/THREE-LICENSE.txt).
Natural Earth 1:110m country polygons: https://www.naturalearthdata.com/about/terms-of-use/ (public domain).
Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson
Country boundaries are a generalized geographic visualization, not a statement about disputed boundaries.
All runtime code and data are served locally; no API keys or backend required.

Preview: python -m http.server 4173 --directory akash-gawai-portfolio
Open http://localhost:4173/#relocation


Checks: node --experimental-vm-modules tests/flight-paths-check.mjs (from repository root).
The harness uses real Three.js geometry with a mocked renderer; it does not verify GPU output or mobile layout.
