"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRiskDashboardAction, listNotificationsAction, markNotificationReadAction, generateRiskAlertsAction } from "../lib/actions";

export function useRiskDashboard() {
  return useQuery({ queryKey: ["risk-dashboard"], queryFn: getRiskDashboardAction });
}

export function useNotifications() {
  return useQuery({ queryKey: ["notifications"], queryFn: listNotificationsAction, refetchInterval: 60_000 });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationReadAction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useGenerateRiskAlerts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateRiskAlertsAction(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
