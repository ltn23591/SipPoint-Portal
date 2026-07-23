import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  SEGMENT_FIELDS,
  SEGMENT_FIELD_OPTIONS,
  SEGMENT_OPERATOR_LABEL,
} from "@/constants/application";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// Giá trị mặc định khi đổi field/operator
const defaultValue = (field, operator) => {
  const cfg = SEGMENT_FIELDS[field];
  if (!cfg) return "";
  if (cfg.valueType === "number") return operator === "between" ? ["", ""] : "";
  if (cfg.valueType === "enum") return cfg.options?.[0]?.value ?? "";
  if (cfg.valueType === "boolean") return true;
  if (cfg.valueType === "months") return [];
  if (cfg.valueType === "tier") return [];
  return "";
};

const newCondition = () => ({
  field: "gender",
  operator: SEGMENT_FIELDS.gender.operators[0],
  value: defaultValue("gender", SEGMENT_FIELDS.gender.operators[0]),
});

function ConditionRow({ condition, tiers, onChange, onRemove }) {
  const cfg = SEGMENT_FIELDS[condition.field];

  const setField = (field) => {
    const operator = SEGMENT_FIELDS[field].operators[0];
    onChange({ field, operator, value: defaultValue(field, operator) });
  };
  const setOperator = (operator) => {
    // number: đổi giữa between (mảng) và scalar cần đổi shape value
    let value = condition.value;
    if (cfg.valueType === "number") value = defaultValue(condition.field, operator);
    onChange({ ...condition, operator, value });
  };
  const setValue = (value) => onChange({ ...condition, value });

  const toggleInArray = (arr, item) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  return (
    <div className="flex flex-wrap items-start gap-2">
      {/* Field */}
      <Select value={condition.field} onValueChange={setField}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SEGMENT_FIELD_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operator */}
      <Select value={condition.operator} onValueChange={setOperator}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {cfg.operators.map((op) => (
            <SelectItem key={op} value={op}>
              {SEGMENT_OPERATOR_LABEL[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value */}
      <div className="flex-1 min-w-[8rem]">
        {cfg.valueType === "number" &&
          (condition.operator === "between" ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="từ"
                value={condition.value?.[0] ?? ""}
                onChange={(e) => setValue([e.target.value, condition.value?.[1] ?? ""])}
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="number"
                placeholder="đến"
                value={condition.value?.[1] ?? ""}
                onChange={(e) => setValue([condition.value?.[0] ?? "", e.target.value])}
              />
            </div>
          ) : (
            <Input
              type="number"
              placeholder="giá trị"
              value={condition.value ?? ""}
              onChange={(e) => setValue(e.target.value)}
            />
          ))}

        {cfg.valueType === "enum" && (
          <Select value={condition.value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cfg.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {cfg.valueType === "boolean" && (
          <Select
            value={condition.value ? "true" : "false"}
            onValueChange={(v) => setValue(v === "true")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Có</SelectItem>
              <SelectItem value="false">Không</SelectItem>
            </SelectContent>
          </Select>
        )}

        {cfg.valueType === "months" && (
          <div className="flex flex-wrap gap-1">
            {MONTHS.map((m) => {
              const active = (condition.value || []).includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setValue(toggleInArray(condition.value || [], m))}
                  className={cn(
                    "h-7 w-8 rounded border text-xs transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary"
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>
        )}

        {cfg.valueType === "tier" && (
          <div className="flex flex-wrap gap-1">
            {tiers.length === 0 ? (
              <span className="text-xs text-muted-foreground">Chưa có hạng thành viên.</span>
            ) : (
              tiers.map((t) => {
                const active = (condition.value || []).includes(t._id);
                return (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setValue(toggleInArray(condition.value || [], t._id))}
                    className={cn(
                      "h-7 rounded border px-2 text-xs transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary"
                    )}
                  >
                    {t.name}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-destructive hover:bg-destructive/10"
        onClick={onRemove}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function SegmentRuleBuilder({ groups, onChange, tiers }) {
  const setGroup = (gi, group) => onChange(groups.map((g, i) => (i === gi ? group : g)));

  const addGroup = () => onChange([...groups, { conditions: [newCondition()] }]);
  const removeGroup = (gi) => onChange(groups.filter((_, i) => i !== gi));

  const addCondition = (gi) =>
    setGroup(gi, { conditions: [...groups[gi].conditions, newCondition()] });
  const removeCondition = (gi, ci) =>
    setGroup(gi, { conditions: groups[gi].conditions.filter((_, i) => i !== ci) });
  const setCondition = (gi, ci, cond) =>
    setGroup(gi, {
      conditions: groups[gi].conditions.map((c, i) => (i === ci ? cond : c)),
    });

  return (
    <div className="space-y-3">
      {groups.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && (
            <div className="my-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600">
                HOẶC
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Nhóm điều kiện {gi + 1}
              </span>
              {groups.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => removeGroup(gi)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            {group.conditions.map((cond, ci) => (
              <div key={ci}>
                {ci > 0 && <div className="my-1 text-xs font-semibold text-primary">VÀ</div>}
                <ConditionRow
                  condition={cond}
                  tiers={tiers}
                  onChange={(c) => setCondition(gi, ci, c)}
                  onRemove={() => removeCondition(gi, ci)}
                />
              </div>
            ))}

            <Button type="button" variant="ghost" size="sm" onClick={() => addCondition(gi)}>
              <Plus className="size-3.5" /> Thêm điều kiện
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" className="w-full border-dashed" onClick={addGroup}>
        <Plus className="size-4" /> Thêm nhóm điều kiện mới
      </Button>
    </div>
  );
}
