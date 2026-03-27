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
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  type OffenderRecord,
  Variant_low_severe_moderate,
  Variant_offenseCategory,
} from "../backend.d";
import {
  useAddOffender,
  useIsCallerAdmin,
  useOffenders,
  useRemoveOffender,
} from "../hooks/useQueries";

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

// --- Sex Offender Registry Static Data ---
type SexOffenderEntry = {
  id: string;
  name: string;
  offenseType: string;
  location: string;
  neighborhood: string;
  severity: Variant_low_severe_moderate;
  description: string;
  registrationStatus: "ACTIVE";
  tier: "Tier I" | "Tier II" | "Tier III";
  regNumber: string;
  photo: string;
};

const MUGSHOTS = [
  "/assets/generated/mugshot-1.dim_80x100.jpg",
  "/assets/generated/mugshot-2.dim_80x100.jpg",
  "/assets/generated/mugshot-3.dim_80x100.jpg",
  "/assets/generated/mugshot-4.dim_80x100.jpg",
  "/assets/generated/mugshot-5.dim_80x100.jpg",
  "/assets/generated/mugshot-6.dim_80x100.jpg",
];

const SEX_OFFENDER_DATA: SexOffenderEntry[] = [
  {
    id: "so-1",
    name: "John A. Doe",
    offenseType: "Lewd Acts with a Minor",
    location: "500 Block of Mission St",
    neighborhood: "SoMa",
    severity: Variant_low_severe_moderate.severe,
    description:
      "Convicted of lewd acts with a minor under 14 years of age. Required to register for life.",
    registrationStatus: "ACTIVE",
    tier: "Tier III",
    regNumber: "SF-2024-0031",
    photo: MUGSHOTS[0],
  },
  {
    id: "so-2",
    name: "Marcus T. Webb",
    offenseType: "Sexual Battery",
    location: "Tenderloin District",
    neighborhood: "Tenderloin",
    severity: Variant_low_severe_moderate.moderate,
    description:
      "Convicted of sexual battery against an adult victim. Required to register for 20 years.",
    registrationStatus: "ACTIVE",
    tier: "Tier II",
    regNumber: "SF-2024-0087",
    photo: MUGSHOTS[1],
  },
  {
    id: "so-3",
    name: "Robert L. Simmons",
    offenseType: "Rape",
    location: "800 Block of Market St",
    neighborhood: "Union Square",
    severity: Variant_low_severe_moderate.severe,
    description:
      "Convicted of rape in the first degree. Lifetime registration requirement.",
    registrationStatus: "ACTIVE",
    tier: "Tier III",
    regNumber: "SF-2023-0112",
    photo: MUGSHOTS[2],
  },
  {
    id: "so-4",
    name: "Derek P. Morris",
    offenseType: "Child Pornography Possession",
    location: "Haight-Ashbury District",
    neighborhood: "Haight-Ashbury",
    severity: Variant_low_severe_moderate.severe,
    description:
      "Convicted of possession and distribution of child pornography. Lifetime registration requirement.",
    registrationStatus: "ACTIVE",
    tier: "Tier III",
    regNumber: "SF-2022-0204",
    photo: MUGSHOTS[3],
  },
  {
    id: "so-5",
    name: "Calvin E. Jackson",
    offenseType: "Indecent Exposure",
    location: "Golden Gate Park Area",
    neighborhood: "Inner Richmond",
    severity: Variant_low_severe_moderate.low,
    description:
      "Convicted of indecent exposure. Required to register for 10 years.",
    registrationStatus: "ACTIVE",
    tier: "Tier I",
    regNumber: "SF-2024-0156",
    photo: MUGSHOTS[4],
  },
  {
    id: "so-6",
    name: "Thomas W. Briggs",
    offenseType: "Statutory Rape",
    location: "Excelsior District",
    neighborhood: "Excelsior",
    severity: Variant_low_severe_moderate.moderate,
    description:
      "Convicted of unlawful sexual intercourse with a minor. 20-year registration requirement.",
    registrationStatus: "ACTIVE",
    tier: "Tier II",
    regNumber: "SF-2023-0299",
    photo: MUGSHOTS[5],
  },
  {
    id: "so-7",
    name: "Eugene R. Dalton",
    offenseType: "Sexual Assault",
    location: "Castro District",
    neighborhood: "Castro",
    severity: Variant_low_severe_moderate.severe,
    description:
      "Convicted of aggravated sexual assault. Lifetime registration requirement.",
    registrationStatus: "ACTIVE",
    tier: "Tier III",
    regNumber: "SF-2021-0341",
    photo: MUGSHOTS[0],
  },
  {
    id: "so-8",
    name: "Franklin D. Kooper",
    offenseType: "Failure to Register as Sex Offender",
    location: "Bayview District",
    neighborhood: "Bayview",
    severity: Variant_low_severe_moderate.moderate,
    description:
      "Failed to update registration within required timeframe. Added to non-compliant list.",
    registrationStatus: "ACTIVE",
    tier: "Tier II",
    regNumber: "SF-2024-0402",
    photo: MUGSHOTS[1],
  },
  {
    id: "so-9",
    name: "Victor H. Stanton",
    offenseType: "Lewd Acts with a Minor",
    location: "Noe Valley",
    neighborhood: "Noe Valley",
    severity: Variant_low_severe_moderate.severe,
    description:
      "Multiple counts of lewd and lascivious acts with children under 14. Lifetime registration.",
    registrationStatus: "ACTIVE",
    tier: "Tier III",
    regNumber: "SF-2020-0518",
    photo: MUGSHOTS[2],
  },
  {
    id: "so-10",
    name: "Allen B. Mercer",
    offenseType: "Indecent Exposure",
    location: "Sunset District",
    neighborhood: "Outer Sunset",
    severity: Variant_low_severe_moderate.low,
    description:
      "Second conviction for indecent exposure in a public park. 10-year registration requirement.",
    registrationStatus: "ACTIVE",
    tier: "Tier I",
    regNumber: "SF-2024-0623",
    photo: MUGSHOTS[3],
  },
  {
    id: "so-11",
    name: "George N. Pullman",
    offenseType: "Sexual Battery",
    location: "Mission District",
    neighborhood: "Mission",
    severity: Variant_low_severe_moderate.moderate,
    description:
      "Convicted of sexual battery against a coworker. 20-year registration requirement.",
    registrationStatus: "ACTIVE",
    tier: "Tier II",
    regNumber: "SF-2023-0711",
    photo: MUGSHOTS[4],
  },
  {
    id: "so-12",
    name: "Harold C. Finch",
    offenseType: "Rape",
    location: "Pacific Heights",
    neighborhood: "Pacific Heights",
    severity: Variant_low_severe_moderate.severe,
    description:
      "Convicted of rape with force and violence. Lifetime registration requirement.",
    registrationStatus: "ACTIVE",
    tier: "Tier III",
    regNumber: "SF-2019-0845",
    photo: MUGSHOTS[5],
  },
];

const TIER_COLORS: Record<"Tier I" | "Tier II" | "Tier III", string> = {
  "Tier I": "#C9A95C",
  "Tier II": "#E07B00",
  "Tier III": "#CC3333",
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
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(new Set());

  // Filter sex offender data
  const filteredSexOffenders = SEX_OFFENDER_DATA.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.location.toLowerCase().includes(q) ||
      o.neighborhood.toLowerCase().includes(q) ||
      o.offenseType.toLowerCase().includes(q)
    );
  });

  // Filter backend offenders
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

  const handlePhotoError = (id: string) => {
    setFailedPhotos((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-8">
      {/* Legal Disclaimer Banner */}
      <div
        className="w-full px-4 py-4 border"
        style={{
          backgroundColor: "rgba(122,0,0,0.08)",
          borderColor: "rgba(122,0,0,0.3)",
        }}
        data-ocid="registry.panel"
      >
        <p
          className="text-[10px] font-bold tracking-widest uppercase mb-2"
          style={{ color: "#CC3333", fontVariant: "small-caps" }}
        >
          ⚠ LEGAL DISCLAIMER
        </p>
        <p
          className="text-[9px] tracking-wider leading-relaxed"
          style={{ color: "#888" }}
        >
          This registry contains information derived solely from publicly
          available government records, including California Megan&apos;s Law
          and the San Francisco Police Department&apos;s public data. All data
          is provided for personal safety awareness purposes only. BLACKGRID
          does not guarantee the accuracy, completeness, or timeliness of the
          information displayed. Use of this information to threaten, harass, or
          intimidate any individual is a criminal offense under California Penal
          Code § 290.46(j). BLACKGRID assumes no liability for actions taken
          based on this information. Information may be outdated — always verify
          with official law enforcement sources.
        </p>
      </div>

      {/* Global Search */}
      <div className="space-y-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search all registries by name, location, or offense..."
          data-ocid="registry.search_input"
          className="bg-[#111] border-[#2A2A2A] text-[#EDEDED] text-xs h-10 focus:border-[#CC3333] placeholder:text-[#444]"
        />
      </div>

      {/* ===== SEX OFFENDER REGISTRY SECTION ===== */}
      <div className="space-y-4">
        {/* Section Header */}
        <div
          className="border-l-4 pl-4 py-2"
          style={{ borderColor: "#CC3333" }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              className="w-5 h-5 flex-shrink-0"
              style={{ color: "#CC3333" }}
            />
            <div>
              <h2
                className="text-lg font-black tracking-widest uppercase"
                style={{ color: "#CC3333" }}
              >
                SEX OFFENDER REGISTRY
              </h2>
              <p
                className="text-[9px] tracking-widest uppercase mt-0.5"
                style={{ color: "#555" }}
              >
                SAN FRANCISCO · PUBLIC RECORD
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#CC3333] animate-pulse" />
              <span
                className="text-[9px] tracking-widest uppercase"
                style={{ color: "#CC3333" }}
              >
                {filteredSexOffenders.length} ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="px-4 py-3 border text-[9px] tracking-wider leading-relaxed"
          style={{
            borderColor: "rgba(204,51,51,0.2)",
            backgroundColor: "rgba(204,51,51,0.04)",
            color: "#888",
          }}
        >
          <span style={{ color: "#CC3333", fontWeight: 700 }}>⚠ NOTICE: </span>
          Data sourced from public sex offender registry. All information is
          public record pursuant to California Penal Code § 290. Misuse of this
          information to harass or threaten any person is a criminal offense.
        </div>

        {/* Sex Offender Cards */}
        <div className="space-y-3" data-ocid="registry.list">
          <AnimatePresence>
            {filteredSexOffenders.length === 0 ? (
              <div className="text-center py-8" style={{ color: "#444" }}>
                <p className="text-[10px] tracking-widest uppercase">
                  NO RESULTS MATCH YOUR SEARCH
                </p>
              </div>
            ) : (
              filteredSexOffenders.map((offender, idx) => (
                <motion.div
                  key={offender.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  data-ocid={`registry.item.${idx + 1}`}
                  className="border p-4"
                  style={{
                    borderColor: "rgba(204,51,51,0.15)",
                    backgroundColor: "#0D0D0D",
                    borderLeft: `3px solid ${TIER_COLORS[offender.tier]}`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Mugshot Photo */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      {failedPhotos.has(offender.id) ? (
                        <div
                          className="w-16 h-20 rounded-sm flex items-center justify-center font-black text-sm"
                          style={{
                            backgroundColor: "#C9A95C",
                            color: "#0A0A0A",
                          }}
                        >
                          {offender.name.charAt(0)}
                        </div>
                      ) : (
                        <img
                          src={offender.photo}
                          alt={`${offender.name} booking`}
                          className="w-16 h-20 object-cover flex-shrink-0"
                          style={{ border: "1px solid rgba(204,51,51,0.4)" }}
                          onError={() => handlePhotoError(offender.id)}
                        />
                      )}
                      <p className="text-[7px] tracking-widest text-[#555] uppercase text-center mt-1">
                        PHOTO
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Name + Badges Row */}
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-sm font-bold tracking-wider uppercase"
                              style={{ color: "#EDEDED" }}
                            >
                              {offender.name}
                            </span>
                            {/* ACTIVE badge */}
                            <span
                              className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 animate-pulse"
                              style={{
                                backgroundColor: "rgba(204,51,51,0.15)",
                                color: "#CC3333",
                                border: "1px solid #CC3333",
                              }}
                            >
                              ● ACTIVE
                            </span>
                            {/* Tier badge */}
                            <span
                              className="text-[8px] font-bold tracking-widest uppercase px-2 py-0.5"
                              style={{
                                color: TIER_COLORS[offender.tier],
                                border: `1px solid ${TIER_COLORS[offender.tier]}`,
                                backgroundColor: `${TIER_COLORS[offender.tier]}15`,
                              }}
                            >
                              {offender.tier}
                            </span>
                          </div>
                          {/* Reg number */}
                          <p
                            className="text-[9px] tracking-widest"
                            style={{ color: "#444" }}
                          >
                            <span style={{ color: "#555" }}>REG. #</span>{" "}
                            {offender.regNumber}
                          </p>
                        </div>
                      </div>

                      {/* Offense type */}
                      <p
                        className="text-[10px] font-bold tracking-wider uppercase"
                        style={{ color: "#CC3333" }}
                      >
                        {offender.offenseType}
                      </p>

                      {/* Location */}
                      <div
                        className="flex items-center gap-3 text-[9px] tracking-widest uppercase"
                        style={{ color: "#555" }}
                      >
                        <span>📍 {offender.neighborhood}</span>
                        <span style={{ color: "#2A2A2A" }}>·</span>
                        <span>{offender.location}</span>
                      </div>

                      {/* Description */}
                      <p
                        className="text-[10px] leading-relaxed"
                        style={{ color: "#666" }}
                      >
                        {offender.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <Separator style={{ backgroundColor: "rgba(201,169,92,0.1)" }} />

      {/* ===== LOCAL THREAT DATABASE SECTION ===== */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-sm font-bold tracking-widest uppercase"
              style={{ color: "#C9A95C" }}
            >
              LOCAL THREAT DATABASE
            </h2>
            <p
              className="text-[9px] tracking-widest uppercase mt-0.5"
              style={{ color: "#555" }}
            >
              ADMIN-MANAGED · AREA INTELLIGENCE
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A95C] animate-pulse" />
            <span
              className="text-[9px] tracking-widest uppercase"
              style={{ color: "#C9A95C" }}
            >
              {filtered.length} REGISTERED
            </span>
          </div>
        </div>

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
                              {Object.values(Variant_offenseCategory).map(
                                (c) => (
                                  <SelectItem
                                    key={c}
                                    value={c}
                                    className="text-[#EDEDED] text-xs"
                                  >
                                    {CATEGORY_LABELS[c]}
                                  </SelectItem>
                                ),
                              )}
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
                              setForm((p) => ({
                                ...p,
                                location: e.target.value,
                              }))
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
                        {addOffender.isPending
                          ? "ADDING..."
                          : "ADD TO REGISTRY"}
                      </Button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Category Filter */}
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

        {/* Local Threat List */}
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
            className="flex flex-col items-center justify-center py-16 gap-4"
            data-ocid="registry.empty_state"
          >
            <Shield className="w-10 h-10" style={{ color: "#2A2A2A" }} />
            <div className="text-center">
              <p
                className="text-[11px] tracking-widest uppercase"
                style={{ color: "#555" }}
              >
                NO ENTRIES IN LOCAL THREAT DATABASE
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
          <ScrollArea className="h-[500px] pr-2">
            <div className="space-y-3">
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
