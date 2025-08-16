import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  AlertTriangle,
  X,
} from "lucide-react";

type StatusType = "safe" | "warning" | "danger";

type StatusCardProps = {
  status: StatusType;
  getStatusCount: (status: string) => number;
};

const STATUS_CONFIG = {
  safe: {
    label: "Safe",
    icon: Check,
    iconColor: "rgb(110 231 183)", // 淺綠
    bgHoverColor: "bg-green-100",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    iconColor: "rgb(250 204 21)", // 黃色
    bgHoverColor: "bg-yellow-100",
  },
  danger: {
    label: "Danger",
    icon: X,
    iconColor: "rgb(239 68 68)", // 紅色
    bgHoverColor: "bg-red-100",
  },
};

function StatusCard({ status, getStatusCount }: StatusCardProps) {
  const [hovered, setHovered] = useState(false);
  const Icon = STATUS_CONFIG[status].icon;
  const iconColor = STATUS_CONFIG[status].iconColor;
  const bgHoverColor = STATUS_CONFIG[status].bgHoverColor;
  const label = STATUS_CONFIG[status].label;

  return (
    <Card
      className="group w-full bg-white border-gray-200 relative overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon
        className="absolute -right-6 top-20 -translate-y-1/2 -rotate-12 pointer-events-none transition-all duration-300"
        style={{
          width: 240,
          height: 380,
          opacity: hovered ? 0.4 : 0.16,
          color: iconColor,
          strokeWidth: hovered ? 2.2 : 2,
          transition: "all 0.3s",
        }}
      />

      <div
        className={`absolute inset-0 transition-opacity duration-300 ${bgHoverColor}`}
        style={{ opacity: hovered ? 0.4 : 0 }}
      />

      <CardContent className="p-6 relative z-10 flex items-center justify-between">
        <div className="text-center">
          <p className="text-gray-600 text-lg font-medium mb-2">{label}</p>
          <div className="bg-black text-white rounded-md px-3 py-1 text-2xl font-bold inline-block">
            {getStatusCount(status)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatusCard;
