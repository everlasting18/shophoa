"use client";

import { useState, useEffect, useCallback } from "react";

export interface District {
  code: number;
  name: string;
}

export interface Ward {
  code: number;
  name: string;
}

const API = "https://provinces.open-api.vn/api";
const HCMC_CODE = 79;

export function useProvinces() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/p/${HCMC_CODE}?depth=2`)
      .then((r) => r.json())
      .then((data: { districts: District[] }) => {
        setDistricts(data.districts || []);
      })
      .catch(() => {});
  }, []);

  const fetchWards = useCallback(async (districtCode: number) => {
    setLoading(true);
    setWards([]);
    try {
      const r = await fetch(`${API}/d/${districtCode}?depth=2`);
      const data: { wards: Ward[] } = await r.json();
      setWards(data.wards || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  return { districts, wards, fetchWards, loading };
}
