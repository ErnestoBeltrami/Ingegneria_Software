import {
    BarChart, Bar, XAxis, YAxis,
    ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import './GraficoRisultati.css';

/**
 * GraficoRisultati — progress-bar style orizzontale con Recharts.
 *
 * Props:
 *   dati       — Array<{ etichetta: string, percentuale: number, colore: string }>
 *   totaleVoti — number (mostrato sopra il grafico)
 */
export default function GraficoRisultati({ dati = [], totaleVoti = 0 }) {
    if (!dati.length) return null;

    const BAR_H = 16;
    const ROW_GAP = 56;
    const chartHeight = dati.length * ROW_GAP + 24;

    return (
        <div className="gr-container">
            {/* Totale voti */}
            <div className="gr-total">
                <span className="gr-total__num">{totaleVoti}</span>
                <span className="gr-total__label">voti totali</span>
            </div>

            {/* Grafico */}
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                    data={dati}
                    layout="vertical"
                    margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
                    barCategoryGap="40%"
                >
                    {/* Asse X — nascosto, dominio 0–100 */}
                    <XAxis
                        type="number"
                        domain={[0, 100]}
                        hide={true}
                    />

                    {/* Asse Y — mostra le etichette, niente linee */}
                    <YAxis
                        type="category"
                        dataKey="etichetta"
                        axisLine={false}
                        tickLine={false}
                        width={110}
                        tick={{
                            fontSize: 14,
                            fontWeight: 500,
                            fontFamily: 'Montserrat, sans-serif',
                            fill: 'var(--text-secondary, #4b5563)',
                        }}
                    />

                    {/* Barra con background (track grigio) */}
                    <Bar
                        dataKey="percentuale"
                        barSize={BAR_H}
                        radius={[10, 10, 10, 10]}
                        background={{ fill: '#f3f4f6', radius: 10 }}
                        isAnimationActive={true}
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {dati.map((entry, i) => (
                            <Cell key={i} fill={entry.colore} />
                        ))}
                        <LabelList
                            dataKey="percentuale"
                            position="right"
                            formatter={(v) => `${v.toFixed(0)}%`}
                            style={{
                                fontSize: 15,
                                fontWeight: 700,
                                fontFamily: 'Montserrat, sans-serif',
                                fill: 'var(--text, #111827)',
                            }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
