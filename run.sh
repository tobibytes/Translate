#!/bin/bash

(cd backend && uvicorn main:app --host 0.0.0.0 --reload) &


(cd frontend && npm run dev)
