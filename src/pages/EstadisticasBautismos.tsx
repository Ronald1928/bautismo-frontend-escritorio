import { useEffect, useState } from "react";
import axios from "axios";
//import { API_URL } from "../config/api";
import API_URL from "../config";
import {
  BarChart,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  /*  Legend, */
  ResponsiveContainer,
} from "recharts";

interface Estadistica {
  mes: string;
  total: number;
}

export default function EstadisticasBautismos() {
  const [data, setData] = useState<Estadistica[]>([]);
  const [totalAnual, setTotalAnual] = useState<number>(0);
  const [anio, setAnio] = useState<number>(2025); // Año por defecto

  const colores = [
    "#4f46e5",
    "#3b82f6",
    "#06b6d4",
    "#10b981",
    "#84cc16",
    "#facc15",
    "#f97316",
    "#ef4444",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
    "#0ea5e9",
  ];

  useEffect(() => {
    axios
      .get(
        `${API_URL}/api/certificados_bautismo/estadisticas-bautismos/${anio}`
      )
      .then((res) => {
        setData(res.data.meses);
        setTotalAnual(res.data.totalAnual);
      })
      .catch((err) => {
        console.error("Error al obtener estadísticas:", err);
      });
  }, [anio]);

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Estadísticas de Bautismos {anio}
      </h2>

      <p className="text-lg font-semibold text-center mb-4">
        Total anual: {totalAnual}
      </p>

      {/* Selector de año */}
      <div className="mb-4 flex justify-center">
        <input
          type="number"
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          className="border rounded p-2 w-32 text-center"
        />
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis allowDecimals={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border rounded shadow">
                    <p className="font-bold">{label}</p>
                    <p>Cantidad de bautismos: {payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          {/* <Legend /> */}

          <Bar
            dataKey="total"
            //fill="#0369a1"
            label={{ position: "top" }}
            radius={[8, 8, 0, 0]}
            //name="Cantidad de Bautismos"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colores[index % colores.length]}
              />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="total"
            stroke="#000"
            strokeWidth={2}
            dot={{ r: 4 }}
            legendType="none"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
