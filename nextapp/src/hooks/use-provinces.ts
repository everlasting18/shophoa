"use client";

import { useState, useEffect, useCallback } from "react";
import { PROVINCES_API, HCMC_CODE } from "@/config";
import type { District, Ward } from "@/schema";

export function useProvinces() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${PROVINCES_API}/p/${HCMC_CODE}?depth=2`)
      .then((r) => r.json())
      .then((data: { districts: District[] }) => {
        setDistricts(data.districts || []);
      })
      .catch(() => { setError(true); });
  }, []);

  const fetchWards = useCallback(async (districtCode: number) => {
    setLoading(true);
    setWards([]);
    try {
      const r = await fetch(`${PROVINCES_API}/d/${districtCode}?depth=2`);
      const data: { wards: Ward[] } = await r.json();
      setWards(data.wards || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { districts, wards, fetchWards, loading, error };
}
