import { Loader2, RefreshCw, Shield, UserCheck, UserX } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApprovalStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useListApprovals, useSetApproval } from "../hooks/useQueries";

function UserAccessSection() {
  const {
    data: approvals,
    isLoading,
    refetch,
    isFetching,
  } = useListApprovals();
  const setApproval = useSetApproval();

  const handleApprove = async (
    principal: import("@icp-sdk/core/principal").Principal,
  ) => {
    try {
      await setApproval.mutateAsync({
        user: principal,
        status: ApprovalStatus.approved,
      });
      toast.success("Access approved.");
    } catch {
      toast.error("Failed to approve user.");
    }
  };

  const handleDeny = async (
    principal: import("@icp-sdk/core/principal").Principal,
  ) => {
    try {
      await setApproval.mutateAsync({
        user: principal,
        status: ApprovalStatus.rejected,
      });
      toast.success("Access denied.");
    } catch {
      toast.error("Failed to deny user.");
    }
  };

  const pendingApprovals =
    approvals?.filter((a) => a.status === ApprovalStatus.pending) ?? [];
  const otherApprovals =
    approvals?.filter((a) => a.status !== ApprovalStatus.pending) ?? [];
  const pendingCount = pendingApprovals.length;

  const getStatusBadge = (status: ApprovalStatus) => {
    if (status === ApprovalStatus.approved) {
      return (
        <span className="px-2 py-0.5 text-[8px] tracking-widest uppercase font-bold bg-[#0D2A0D] text-[#2ECC71] border border-[#2ECC71]/30">
          APPROVED
        </span>
      );
    }
    if (status === ApprovalStatus.rejected) {
      return (
        <span className="px-2 py-0.5 text-[8px] tracking-widest uppercase font-bold bg-[#2A0D0D] text-[#CC3333] border border-[#CC3333]/30">
          DENIED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[8px] tracking-widest uppercase font-bold bg-[#2A2200] text-[#C9A95C] border border-[#C9A95C]/30 animate-pulse">
        PENDING
      </span>
    );
  };

  const sortedApprovals = [...pendingApprovals, ...otherApprovals];

  return (
    <div data-ocid="admin.user_access.panel" className="mb-8">
      {/* Prominent pending alert */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          data-ocid="admin.pending_requests.panel"
          className="mb-5 p-4 bg-[#1A0A00] flex items-center gap-4"
          style={{
            border: "1px solid rgba(201,169,92,0.6)",
            boxShadow:
              "0 0 20px rgba(201,169,92,0.12), inset 0 0 20px rgba(201,169,92,0.04)",
            animation: "pulse-border 2s ease-in-out infinite",
          }}
        >
          <div className="flex-shrink-0 w-8 h-8 bg-[#CC3333] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">
              {pendingCount}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#C9A95C]">
              {pendingCount} PENDING ACCESS REQUEST{pendingCount > 1 ? "S" : ""}
            </p>
            <p className="text-[8px] tracking-wide uppercase text-[#8A8A8A] mt-0.5">
              Verify Chime payment before approving each user
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#CC3333] animate-pulse flex-shrink-0" />
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#C9A95C]" />
          <div>
            <p className="text-[9px] tracking-widest uppercase text-[#8A8A8A]">
              ADMIN
            </p>
            <h3 className="text-sm font-bold tracking-widest uppercase text-[#EDEDED] flex items-center gap-2">
              ACCESS REQUESTS
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 bg-[#CC3333] text-white text-[8px] font-bold">
                  {pendingCount} PENDING
                </span>
              )}
            </h3>
          </div>
        </div>
        <button
          type="button"
          data-ocid="admin.user_access.button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2A2A2A] text-[#8A8A8A] text-[9px] tracking-widest uppercase hover:border-[#C9A95C] hover:text-[#C9A95C] transition-all disabled:opacity-40"
        >
          <RefreshCw
            className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`}
          />
          REFRESH
        </button>
      </div>

      {isLoading ? (
        <div
          data-ocid="admin.user_access.loading_state"
          className="flex items-center gap-3 py-6"
        >
          <Loader2 className="w-4 h-4 animate-spin text-[#C9A95C]" />
          <span className="text-xs text-[#8A8A8A] tracking-wide uppercase">
            Loading requests...
          </span>
        </div>
      ) : !approvals || approvals.length === 0 ? (
        <div
          data-ocid="admin.user_access.empty_state"
          className="py-8 text-center border border-[#2A2A2A]"
        >
          <Shield className="w-8 h-8 text-[#3A3A3A] mx-auto mb-3" />
          <p className="text-[#4A4A4A] text-[10px] tracking-widest uppercase">
            No access requests yet.
          </p>
        </div>
      ) : (
        <div
          className="border border-[#2A2A2A] overflow-hidden"
          data-ocid="admin.user_access.table"
        >
          {sortedApprovals.map((info, i) => (
            <div
              key={info.principal.toText()}
              data-ocid={`admin.user_access.item.${i + 1}`}
              className={`border-b border-[#1A1A1A] last:border-b-0 transition-colors ${
                info.status === ApprovalStatus.pending
                  ? "bg-[#131000]"
                  : "hover:bg-[#111111]"
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-4 min-w-0">
                  <code className="text-[10px] font-mono text-[#C9A95C] truncate max-w-[140px]">
                    {info.principal.toText().slice(0, 20)}...
                  </code>
                  {getStatusBadge(info.status)}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    data-ocid={`admin.approve.button.${i + 1}`}
                    onClick={() => handleApprove(info.principal)}
                    disabled={
                      setApproval.isPending ||
                      info.status === ApprovalStatus.approved
                    }
                    className="flex items-center gap-1.5 px-4 py-2 text-[9px] tracking-widest uppercase font-bold border border-[#2ECC71]/40 text-[#2ECC71] hover:bg-[#2ECC71]/15 active:bg-[#2ECC71]/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    APPROVE
                  </button>
                  <button
                    type="button"
                    data-ocid={`admin.deny.button.${i + 1}`}
                    onClick={() => handleDeny(info.principal)}
                    disabled={
                      setApproval.isPending ||
                      info.status === ApprovalStatus.rejected
                    }
                    className="flex items-center gap-1.5 px-4 py-2 text-[9px] tracking-widest uppercase font-bold border border-[#CC3333]/40 text-[#CC3333] hover:bg-[#CC3333]/15 active:bg-[#CC3333]/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    DENY
                  </button>
                </div>
              </div>
              {info.status === ApprovalStatus.pending && (
                <div className="px-4 pb-2.5">
                  <p className="text-[8px] tracking-wide uppercase text-[#6A6A6A] flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#C9A95C]/60" />
                    Verify Chime payment to $Alise-Grey before approving
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .isCallerAdmin()
      .then(setIsAdmin)
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [actor, isFetching]);

  if (checking || !isAdmin) return null;

  const principalText = identity?.getPrincipal().toText() ?? "";

  return (
    <div
      data-ocid="admin.panel"
      className="mt-8 border border-[#2A2A2A] bg-[#111111] p-6"
    >
      <div className="mb-6 p-3 bg-[#0A0A0A] border border-[#C9A95C]/20 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#C9A95C] animate-pulse" />
        <div className="flex-1">
          <p className="text-[9px] tracking-widest uppercase text-[#C9A95C]">
            ADMIN · $Alise-Grey · acgagc7@gmail.com
          </p>
          <code className="text-[10px] font-mono text-[#8A8A8A]">
            {principalText.slice(0, 24)}...
          </code>
        </div>
        <span className="px-2 py-0.5 text-[8px] tracking-widest uppercase font-bold bg-[#1A0A00] text-[#C9A95C] border border-[#C9A95C]/30">
          BLACK TIER
        </span>
      </div>
      <UserAccessSection />
    </div>
  );
}
