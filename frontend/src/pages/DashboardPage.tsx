import { useMemo } from 'react';
import {
  BarChart3, CheckCircle2, Package, Truck, TrendingDown, TrendingUp,
  AlertCircle, Warehouse, Clock, MapPin
} from 'lucide-react';
import { Bar, BarChart, Cell, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from 'recharts';
import { useDonations, useEnvios, useDashboardKPIs, useActivities, useAlerts, useRegionStatus } from '../hooks/useQueries';
import { useAuthStore } from '../store/authStore';
import { DONATION_TYPE_LABELS } from '../mock/donations';

const palette = ['#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626'];

const CATEGORY_COLORS: Record<string, string> = {

  // En caso de, asi siempre cae en alguna categoria xd
  // son un monton, si, pero q se le hará, asi no queda blanco y negro
  // Agua
  agua:          '#5b8fa8',
  bebida:        '#5b8fa8',
  líquido:       '#5b8fa8',
  liquido:       '#5b8fa8',

  // Comida
  comida:        '#c4824a',
  alimento:      '#c4824a',
  alimentos:     '#c4824a',
  comestible:    '#c4824a',
  carne:         '#c4824a',
  fruta:         '#c4824a',
  verdura:       '#c4824a',
  vegetal:       '#c4824a',
  cereal:        '#c4824a',
  lácteo:        '#c4824a',
  lacteo:        '#c4824a',
  conserva:      '#c4824a',
  enlatado:      '#c4824a',

  // Ropa
  ropa:          '#a78b6f',
  vestimenta:    '#a78b6f',
  calzado:       '#a78b6f',
  zapato:        '#a78b6f',
  abrigo:        '#a78b6f',
  prenda:        '#a78b6f',
  textil:        '#a78b6f',
  tela:          '#a78b6f',

  // Medicamentos
  medicamento:   '#7a9e7e',
  medicina:      '#7a9e7e',
  fármaco:       '#7a9e7e',
  farmaco:       '#7a9e7e',
  remedio:       '#7a9e7e',
  pastilla:      '#7a9e7e',
  vacuna:        '#7a9e7e',

  // Higiene
  higiene:       '#9e8fa8',
  limpieza:      '#9e8fa8',
  jabón:         '#9e8fa8',
  jabon:         '#9e8fa8',
  shampoo:       '#9e8fa8',
  champú:        '#9e8fa8',
  champu:        '#9e8fa8',
  detergente:    '#9e8fa8',
  desinfectante: '#9e8fa8',
  toalla:        '#9e8fa8',
  pañal:         '#9e8fa8',
  panal:         '#9e8fa8',

  // Muebles / Hogar
  mueble:        '#8f8f7a',
  hogar:         '#8f8f7a',
  cama:          '#8f8f7a',
  colchón:       '#8f8f7a',
  colchon:       '#8f8f7a',
  silla:         '#8f8f7a',
  mesa:          '#8f8f7a',
  frazada:       '#8f8f7a',
  sábana:        '#8f8f7a',
  sabana:        '#8f8f7a',
  almohada:      '#8f8f7a',

  // Tecnología
  tecnología:    '#7a8fa8',
  tecnologia:    '#7a8fa8',
  electrónico:   '#7a8fa8',
  electronico:   '#7a8fa8',
  computador:    '#7a8fa8',
  celular:       '#7a8fa8',
  teléfono:      '#7a8fa8',
  telefono:      '#7a8fa8',
};

const ENVIO_STATE_COLORS: Record<string, string> = {
  entregado: '#7a9e7e',
  en_ruta:   '#d4d4d4',
  pendiente: '#a3a3a3',
  cancelado: '#9e5a5a',
  rechazado: '#9e5a5a',
  pendiente_acopio: '#af6666',
};

function getCategoryColor(name: string, index: number): string {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return palette[index % palette.length];
}

function getEnvioStateColor(estado: string): string {
  return ENVIO_STATE_COLORS[estado.toLowerCase()] ?? '#737373';
}

const iconMap: Record<string, React.ReactNode> = {
  Package:     <Package className="w-5 h-5" />,
  AlertCircle: <AlertCircle className="w-5 h-5" />,
  CheckCircle2:<CheckCircle2 className="w-5 h-5" />,
  Warehouse:   <Warehouse className="w-5 h-5" />,
  Clock:       <Clock className="w-5 h-5" />,
  Truck:       <Truck className="w-5 h-5" />,
};

const colorMap: Record<string, string> = {
  cyan:  'text-foreground bg-white/5',
  green: 'text-foreground bg-white/5',
  amber: 'text-foreground bg-white/5',
  red:   'text-foreground bg-white/5',
  blue:  'text-foreground bg-white/5',
  slate: 'text-muted-foreground bg-white/5',
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const { data: donations = [] } = useDonations();
  const { data: envios = [] } = useEnvios();
  const { data: kpis } = useDashboardKPIs();
  const { data: activities } = useActivities(8);
  const { data: alerts } = useAlerts();
  const { data: regions } = useRegionStatus();

  const donationTypeData = useMemo(() => {
    const counts = donations.reduce<Record<string, number>>((accumulator, donation) => {
      const key = (donation.tipo ?? 'otros').toString();
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([type, value]) => ({
      name: DONATION_TYPE_LABELS[type as keyof typeof DONATION_TYPE_LABELS] ?? type,
      value,
    }));
  }, [donations]);

  const enviosStateData = useMemo(() => {
    const counts = envios.reduce<Record<string, number>>((accumulator, envio) => {
      accumulator[envio.estado] = (accumulator[envio.estado] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([estado, value]) => ({ estado, value }));
  }, [envios]);

  const DONATIONS_BY_WEEK = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const weeks: { week: string; donations: number; entregas: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const start = new Date(startOfToday);
      start.setDate(startOfToday.getDate() + i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const donationsCount = donations.filter(d => {
        const dt = (d as any).createdAt ? new Date((d as any).createdAt) : null;
        return dt ? dt >= start && dt <= end : false;
      }).length;

      const entregasCount = envios.filter(e => {
        const dt = (e as any).createdAt ? new Date((e as any).createdAt) : null;
        return dt ? dt >= start && dt <= end && e.estado === 'entregado' : false;
      }).length;

      weeks.push({ week: `S${i + 1}`, donations: donationsCount, entregas: entregasCount });
    }
    return weeks;
  }, [donations, envios]);

  const totalDonations = donations.length;
  const totalEnvios = envios.length;
  const pendingEnvios = envios.filter(envio => envio.estado !== 'entregado').length;
  const donationTypes = donationTypeData.length;
  const donationsKpi = kpis?.find(kpi => kpi.label === 'Donaciones recibidas');
  const totalDonationsDisplay = typeof donationsKpi?.value === 'number' && donationsKpi.value > 0
    ? donationsKpi.value
    : totalDonations;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {user?.role === 'donante' ? 'Bienvenido a Donaton' : 'Panel de Control'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen de operaciones y métricas en tiempo real
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="mb-2">
            <Package className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalDonationsDisplay}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Donaciones registradas</p>
        </div>
        <div className="kpi-card">
          <div className="mb-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalEnvios}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Envíos totales</p>
        </div>
        <div className="kpi-card">
          <div className="mb-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingEnvios}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Envíos pendientes</p>
        </div>
        <div className="kpi-card">
          <div className="mb-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{donationTypes}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tipos de donación</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis?.map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${colorMap[kpi.color]}`}>
                {iconMap[kpi.icon]}
              </div>
              {kpi.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  kpi.change > 0 ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {kpi.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(kpi.change)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
            {kpi.changeLabel && (
              <p className="text-xs text-muted-foreground mt-1">{kpi.changeLabel}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="section-card">
          <div className="section-card-header">
            <h3 className="font-semibold text-foreground">Donaciones por tipo</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={donationTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                  {donationTypeData.map((entry, index) => (
                    <Cell key={entry.name} fill={getCategoryColor(entry.name, index)} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #222222', borderRadius: '4px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2">
              {donationTypeData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: getCategoryColor(item.name, index) }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-header">
            <h3 className="font-semibold text-foreground">Estados de envío</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={enviosStateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="estado" stroke="#4a4a4a" fontSize={12} />
                <YAxis stroke="#4a4a4a" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #222222', borderRadius: '4px', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {enviosStateData.map((entry) => (
                    <Cell key={entry.estado} fill={getEnvioStateColor(entry.estado)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="font-semibold text-foreground">Donaciones vs Entregas</h3>
              <span className="text-xs text-muted-foreground">Últimas 6 semanas</span>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={DONATIONS_BY_WEEK}>
                  <defs>
                    <linearGradient id="colorDon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4d4d4" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#d4d4d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEnt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#737373" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#737373" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="week" stroke="#4a4a4a" fontSize={12} />
                  <YAxis stroke="#4a4a4a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #222222', borderRadius: '4px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="donations" stroke="#d4d4d4" fillOpacity={1} fill="url(#colorDon)" strokeWidth={1.5} />
                  <Area type="monotone" dataKey="entregas" stroke="#737373" fillOpacity={1} fill="url(#colorEnt)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="section-card">
              <div className="section-card-header">
                <h3 className="font-semibold text-foreground">Últimas donaciones</h3>
              </div>
              <div className="p-0">
                {donations.slice(0, 5).map(donation => (
                  <div key={donation.id} className="px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{donation.descripcion}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{DONATION_TYPE_LABELS[donation.tipo as keyof typeof DONATION_TYPE_LABELS] ?? donation.tipo} · {donation.direccion}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">#{donation.id}</span>
                    </div>
                  </div>
                ))}
                {donations.length === 0 && (
                  <div className="px-5 py-6 text-center text-sm text-muted-foreground">Sin donaciones registradas</div>
                )}
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <h3 className="font-semibold text-foreground">Últimos envíos</h3>
              </div>
              <div className="p-0">
                {envios.slice(0, 5).map(envio => (
                  <div key={envio.id} className="px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Envío #{envio.id}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Donación {envio.donacionId} · {envio.direccion}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{envio.estado}</span>
                    </div>
                  </div>
                ))}
                {envios.length === 0 && (
                  <div className="px-5 py-6 text-center text-sm text-muted-foreground">Sin envíos registrados</div>
                )}
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <h3 className="font-semibold text-foreground">Estado por región</h3>
            </div>
            <div className="p-0">
              {regions?.map(region => (
                <div key={region.region} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{region.region}</p>
                      <p className="text-xs text-muted-foreground">
                        {region.centersCount} centros · {region.activeNeeds} necesidades
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {region.status === 'normal' ? 'Normal' : region.status === 'alerta' ? 'Alerta' : 'Crítica'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {region.avgDeliveryTime}h promedio
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="section-card">
            <div className="section-card-header">
              <h3 className="font-semibold text-foreground">Alertas logísticas</h3>
            </div>
            <div className="p-0">
              {alerts?.filter(a => !a.resolved).slice(0, 5).map(alert => (
                <div key={alert.id} className="px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full mt-2 shrink-0 bg-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.centerName || alert.region} · {new Date(alert.timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(!alerts || alerts.filter(a => !a.resolved).length === 0) && (
                <div className="px-5 py-6 text-center text-sm text-muted-foreground">Sin alertas activas</div>
              )}
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <h3 className="font-semibold text-foreground">Actividad reciente</h3>
            </div>
            <div className="p-0">
              {activities?.map(activity => (
                <div key={activity.id} className="px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.userName ? `${activity.userName} · ` : ''}
                      {new Date(activity.timestamp).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}