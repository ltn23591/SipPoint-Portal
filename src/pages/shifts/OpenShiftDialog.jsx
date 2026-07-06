import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmployeeApi } from "@/apis";

export function OpenShiftDialog({ open, onOpenChange, onSubmit, loading }) {
  const [employeeId, setEmployeeId] = useState("");
  const [startingCash, setStartingCash] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setEmployeeId("");
      setStartingCash("");
      setError("");
    }
  }, [open]);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await EmployeeApi.getAll();
      return res?.data?.success ? res.data.data || [] : [];
    },
    enabled: open,
    staleTime: 5 * 60_000,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId) return setError("Vui lòng chọn nhân viên.");
    onSubmit({
      employeeId,
      startingCash: Number(startingCash) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Mở ca làm việc</DialogTitle>
            <DialogDescription>
              Chọn nhân viên trực ca và nhập tiền quỹ đầu ca.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>
              Nhân viên <span className="text-destructive">*</span>
            </Label>
            <Select
              value={employeeId}
              onValueChange={(v) => {
                setEmployeeId(v);
                if (error) setError("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.name} ({e.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="starting-cash">Tiền quỹ đầu ca (đ)</Label>
            <Input
              id="starting-cash"
              type="number"
              min={0}
              value={startingCash}
              onChange={(e) => setStartingCash(e.target.value)}
              placeholder="VD: 1000000"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Mở ca
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
