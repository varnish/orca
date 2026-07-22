#!/bin/bash
k6 run $(grep -v '^#' .env | sed 's/^/-e /' | tr '\n' ' ') --summary-trend-stats="min,max,med,p(95)" docker_pull.js