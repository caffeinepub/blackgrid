import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Shield, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  type OffenderRecord,
  Variant_low_severe_moderate,
  Variant_offenseCategory,
} from "../backend.d";
import {
  useAddOffender,
  useOffenders,
  useRemoveOffender,
} from "../hooks/useQueries";
import { useIsCallerAdmin } from "../hooks/useQueries";

type CategoryFilter = "all" | Variant_offenseCategory;

const CATEGORY_LABELS: Record<Variant_offenseCategory, string> = {
  [Variant_offenseCategory.violent]: "VIOLENT",
  [Variant_offenseCategory.property]: "PROPERTY",
  [Variant_offenseCategory.sex_offense]: "SEX OFFENSE",
  [Variant_offenseCategory.drug]: "DRUG",
  [Variant_offenseCategory.other]: "OTHER",
};

const CATEGORY_COLORS: Record<Variant_offenseCategory, string> = {
  [Variant_offenseCategory.violent]: "#7A0000",
  [Variant_offenseCategory.property]: "#5A3E00",
  [Variant_offenseCategory.sex_offense]: "#4A0040",
  [Variant_offenseCategory.drug]: "#1A3A00",
  [Variant_offenseCategory.other]: "#1A1A2E",
};

const SEVERITY_COLORS: Record<Variant_low_severe_moderate, string> = {
  [Variant_low_severe_moderate.low]: "#C9A95C",
  [Variant_low_severe_moderate.moderate]: "#E07B00",
  [Variant_low_severe_moderate.severe]: "#CC3333",
};

const SEVERITY_LABELS: Record<Variant_low_severe_moderate, string> = {
  [Variant_low_severe_moderate.low]: "LOW",
  [Variant_low_severe_moderate.moderate]: "MODERATE",
  [Variant_low_severe_moderate.severe]: "SEVERE",
};

type NewOffenderForm = {
  name: string;
  offenseType: string;
  offenseCategory: Variant_offenseCategory;
  location: string;
  neighborhood: string;
  severity: Variant_low_severe_moderate;
  description: string;
};

const DEFAULT_FORM: NewOffenderForm = {
  name: "",
  offenseType: "",
  offenseCategory: Variant_offenseCategory.violent,
  location: "",
  neighborhood: "",
  severity: Variant_low_severe_moderate.moderate,
  description: "",
};

export default function OffenderRegistry() {
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: offenders, isLoading } = useOffenders();
  const addOffender = useAddOffender();
  const removeOffender = useRemoveOffender();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<NewOffenderForm>(DEFAULT_FORM);

  const filtered = (offenders ?? []).filter((o) => {
    const matchesSearch =
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase()) ||
      o.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || o.offenseCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const record: OffenderRecord = {
      id: BigInt(0),
      name: form.name,
      offenseType: form.offenseType,
      offenseCategory: form.offenseCategory,
      location: form.location,
      neighborhood: form.neighborhood,
      severity: form.severity,
      description: form.description,
      addedAt: BigInt(Date.now()),
      addedBy: {} as any,
    };
    await addOffender.mutateAsync(record);
    setForm(DEFAULT_FORM);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold tracking-widest uppercase"
            style={{ color: "#C9A95C" }}
          >
            OFFENDER REGISTRY
          </h1>
          <p
            className="text-[10px] tracking-widest uppercase mt-1"
            style={{ color: "#555" }}
          >
            LOCAL AREA THREAT INTELLIGENCE
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#CC3333] animate-pulse" />
          <span
            className="text-[9px] tracking-widest uppercase"
            style={{ color: "#CC3333" }}
          >
            {filtered.length} REGISTERED
          </span>
        </div>
      </div>

      <Separator style={{ backgroundColor: "rgba(201,169,92,0.15)" }} />

      {/* Admin Add Form */}
      {isAdmin && (
        <div
          className="border"
          style={{
            borderColor: "rgba(201,169,92,0.3)",
            backgroundColor: "rgba(201,169,92,0.03)",
          }}
          data-ocid="registry.panel"
        >
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-left"
            onClick={() => setShowAddForm((v) => !v)}
            data-ocid="registry.open_modal_button"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A95C] animate-pulse" />
              <span
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: "#C9A95C" }}
              >
                ADMIN REGISTRY CONTROL
              </span>
            </div>
            {showAddForm ? (
              <ChevronUp className="w-4 h-4" style={{ color: "#C9A95C" }} />
            ) : (
              <ChevronDown className="w-4 h-4" style={{ color: "#C9A95C" }} />
            )}
          </button>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div className="px-4 pb-5">
                  <Separator
                    className="mb-4"
                    style={{ backgroundColor: "rgba(201,169,92,0.2)" }}
                  />
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="reg-name"
                          className="text-[9px] tracking-widest uppercase"
                          style={{ color: "#8A8A8A" }}
                        >
                          NAME
                        </Label>
                        <Input
                          id="reg-name"
                          value={form.name}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, name: e.target.value }))
                          }
                          required
                          data-ocid="registry.input"
                          className="bg-[#111] border-[#2A2A2A] text-[#EDEDED] text-xs h-9 focus:border-[#C9A95C]"
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="reg-offense-type"
                          className="text-[9px] tracking-widest uppercase"
                          style={{ color: "#8A8A8A" }}
                        >
                          OFFENSE TYPE
                        </Label>
                        <Input
                          id="reg-offense-type"
                          value={form.offenseType}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              offenseType: e.target.value,
                            }))
                          }
                          required
                          data-ocid="registry.input"
                          className="bg-[#111] border-[#2A2A2A] text-[#EDEDED] text-xs h-9 focus:border-[#C9A95C]"
                          placeholder="e.g. Robbery"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          className="text-[9px] tracking-widest uppercase"
                          style={{ color: "#8A8A8A" }}
                        >
                          CATEGORY
                        </Label>
                        <Select
                          value={form.offenseCategory}
                          onValueChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              offenseCategory: v as Variant_offenseCategory,
                            }))
                          }
                        >
                          <SelectTrigger
                            data-ocid="registry.select"
                            className="bg-[#111] border-[#2A2A2A] text-[#EDEDED] text-xs h-9"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border-[#2A2A2A]">
                            {Object.values(Variant_offenseCategory).map((c) => (
                              <SelectItem
                                key={c}
                                value={c}
                                className="text-[#EDEDED] text-xs"
                              >
                                {CATEGORY_LABELS[c]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          className="text-[9px] tracking-widest uppercase"
                          style={{ color: "#8A8A8A" }}
                        >
                          SEVERITY
                        </Label>
                        <Select
                          value={form.severity}
                          onValueChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              severity: v as Variant_low_severe_moderate,
                            }))
                          }
                        >
                          <SelectTrigger
                            data-ocid="registry.select"
                            className="bg-[#111] border-[#2A2A2A] text-[#EDEDED] text-xs h-9"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border-[#2A2A2A]">
                            {Object.values(Variant_low_severe_moderate).map(
                              (s) => (
                                <SelectItem
                                  key={s}
                                  value={s}
                                  className="text-[#EDEDED] text-xs"
                                >
                                  {SEVERITY_LABELS[s]}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="reg-location"
                          className="text-[9px] tracking-widest uppercase"
                          style={{ color: "#8A8A8A" }}
                        >
                          LOCATION
                        </Label>
                        <Input
                          id="reg-location"
                          value={form.location}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, location: e.target.value }))
                          }
                          required
                          data-ocid="registry.input"
                          className="bg-[#111] border-[#2A2A2A] text-[#EDEDED] text-xs h-9 focus:border-[#C9A95C]"
                          placeholder="Address or area"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="reg-neighborhood"
                          className="text-[9px] tracking-widest uppercase"
                          style={{ color: "#8A8A8A" }}
                        >
                          NEIGHBORHOOD
                        </Label>
                        <Input
                          id="reg-neighborhood"
                          value={form.neighborhood}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              neighborhood: e.target.value,
                            }))
                          }
                          required
                          data-ocid="registry.input"
                          className="bg-[#111] border-[#2A2A2A] text-[#EDEDED] text-xs h-9 focus:border-[#C9A95C]"
                          placeholder="District / Neighborhood"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reg-desc"
                        className="text-[9px] tracking-widest uppercase"
                        style={{ color: "#8A8A8A" }}
                      >
                        DESCRIPTION
                      </Label>
                      <Textarea
                        id="reg-desc"
                        value={form.description}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        data-ocid="registry.textarea"
                        className="bg-[#111] border-[#2A2A2A] text-[#EDEDED] text-xs focus:border-[#C9A95C] resize-none"
                        rows={3}
                        placeholder="Offense details, pattern of behavior, known associates..."
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={addOffender.isPending}
                      data-ocid="registry.submit_button"
                      className="h-9 text-[9px] tracking-widest uppercase font-bold bg-[#C9A95C] text-[#0A0A0A] hover:bg-[#E8C878] border-0"
                    >
                      {addOffender.isPending ? "ADDING..." : "ADD TO REGISTRY"}
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Search + Filter */}
      <div className="space-y-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, location, or neighborhood..."
          data-ocid="registry.search_input"
          className="bg-[#111] border-[#2A2A2A] text-[#EDEDED] text-xs h-9 focus:border-[#C9A95C] placeholder:text-[#444]"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              "all",
              ...Object.values(Variant_offenseCategory),
            ] as CategoryFilter[]
          ).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              data-ocid="registry.tab"
              className={`px-3 py-1 text-[9px] tracking-widest uppercase transition-all border ${
                categoryFilter === cat
                  ? "border-[#C9A95C] text-[#C9A95C] bg-[rgba(201,169,92,0.08)]"
                  : "border-[#2A2A2A] text-[#555] hover:text-[#888] hover:border-[#444]"
              }`}
            >
              {cat === "all" ? "ALL" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="registry.loading_state"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A95C] animate-pulse" />
            <span
              className="text-[9px] tracking-widest uppercase"
              style={{ color: "#C9A95C" }}
            >
              LOADING REGISTRY...
            </span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
          data-ocid="registry.empty_state"
        >
          <Shield className="w-12 h-12" style={{ color: "#2A2A2A" }} />
          <div className="text-center">
            <p
              className="text-[11px] tracking-widest uppercase"
              style={{ color: "#555" }}
            >
              NO OFFENDERS REGISTERED IN YOUR AREA
            </p>
            <p
              className="text-[9px] tracking-widest uppercase mt-1"
              style={{ color: "#333" }}
            >
              AREA CLEAR · STAY VIGILANT
            </p>
          </div>
        </motion.div>
      ) : (
        <ScrollArea className="h-[600px] pr-2">
          <div className="space-y-3" data-ocid="registry.list">
            {filtered.map((offender, idx) => (
              <OffenderCard
                key={String(offender.id)}
                offender={offender}
                isAdmin={!!isAdmin}
                index={idx + 1}
                onDelete={() => removeOffender.mutate(offender.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function OffenderCard({
  offender,
  isAdmin,
  index,
  onDelete,
}: {
  offender: OffenderRecord;
  isAdmin: boolean;
  index: number;
  onDelete: () => void;
}) {
  const severityColor = SEVERITY_COLORS[offender.severity];
  const categoryColor = CATEGORY_COLORS[offender.offenseCategory];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      data-ocid={`registry.item.${index}`}
      className="border p-4 space-y-2.5"
      style={{
        borderColor: "rgba(201,169,92,0.1)",
        backgroundColor: "#0D0D0D",
        borderLeft: `2px solid ${severityColor}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-sm font-semibold tracking-wider uppercase"
              style={{ color: "#EDEDED" }}
            >
              {offender.name}
            </span>
            <span
              className="text-[9px] tracking-widest uppercase px-2 py-0.5"
              style={{
                backgroundColor: categoryColor,
                color: "#EDEDED",
                border: `1px solid ${categoryColor}`,
              }}
            >
              {CATEGORY_LABELS[offender.offenseCategory]}
            </span>
            <span
              className="text-[9px] tracking-widest uppercase px-2 py-0.5 font-bold"
              style={{
                color: severityColor,
                border: `1px solid ${severityColor}`,
                backgroundColor: `${severityColor}15`,
              }}
            >
              {SEVERITY_LABELS[offender.severity]}
            </span>
          </div>
          <p
            className="text-[10px] tracking-wider uppercase mt-1"
            style={{ color: "#C9A95C" }}
          >
            {offender.offenseType}
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={onDelete}
            data-ocid={`registry.delete_button.${index}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] tracking-widest uppercase transition-all border border-[#7A0000] text-[#CC3333] hover:bg-[#7A0000] hover:text-white flex-shrink-0"
          >
            <Trash2 className="w-3 h-3" />
            DELETE
          </button>
        )}
      </div>

      <div
        className="flex items-center gap-4 text-[9px] tracking-widest uppercase"
        style={{ color: "#555" }}
      >
        <span>📍 {offender.neighborhood}</span>
        <span style={{ color: "#3A3A3A" }}>·</span>
        <span>{offender.location}</span>
      </div>

      {offender.description && (
        <p className="text-[10px] leading-relaxed" style={{ color: "#777" }}>
          {offender.description.length > 160
            ? `${offender.description.slice(0, 160)}...`
            : offender.description}
        </p>
      )}
    </motion.div>
  );
}
