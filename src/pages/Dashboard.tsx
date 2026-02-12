import { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Building2,
  ClipboardList,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Calendar,
  Mail,
  Phone,
  Euro,
  GraduationCap,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import type { Dozenten, Teilnehmer, Raeume, Kurse, Anmeldungen } from '@/types/app';

type TabId = 'kurse' | 'dozenten' | 'teilnehmer' | 'raeume' | 'anmeldungen';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'kurse', label: 'Kurse', icon: BookOpen },
  { id: 'dozenten', label: 'Dozenten', icon: GraduationCap },
  { id: 'teilnehmer', label: 'Teilnehmer', icon: Users },
  { id: 'raeume', label: 'Räume', icon: Building2 },
  { id: 'anmeldungen', label: 'Anmeldungen', icon: ClipboardList },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('kurse');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Data states
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [kurse, setKurse] = useState<Kurse[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [doz, teil, raeu, kur, anm] = await Promise.all([
        LivingAppsService.getDozenten(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getRaeume(),
        LivingAppsService.getKurse(),
        LivingAppsService.getAnmeldungen(),
      ]);
      setDozenten(doz);
      setTeilnehmer(teil);
      setRaeume(raeu);
      setKurse(kur);
      setAnmeldungen(anm);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = {
    kurse: kurse.length,
    dozenten: dozenten.length,
    teilnehmer: teilnehmer.length,
    raeume: raeume.length,
    anmeldungen: anmeldungen.length,
    bezahlt: anmeldungen.filter(a => a.fields.bezahlt).length,
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Wirklich löschen?')) return;
    setSaving(true);
    try {
      switch (activeTab) {
        case 'dozenten':
          await LivingAppsService.deleteDozentenEntry(id);
          setDozenten(prev => prev.filter(d => d.record_id !== id));
          break;
        case 'teilnehmer':
          await LivingAppsService.deleteTeilnehmerEntry(id);
          setTeilnehmer(prev => prev.filter(t => t.record_id !== id));
          break;
        case 'raeume':
          await LivingAppsService.deleteRaeumeEntry(id);
          setRaeume(prev => prev.filter(r => r.record_id !== id));
          break;
        case 'kurse':
          await LivingAppsService.deleteKurseEntry(id);
          setKurse(prev => prev.filter(k => k.record_id !== id));
          break;
        case 'anmeldungen':
          await LivingAppsService.deleteAnmeldungenEntry(id);
          setAnmeldungen(prev => prev.filter(a => a.record_id !== id));
          break;
      }
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Fehler beim Löschen');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      switch (activeTab) {
        case 'dozenten': {
          const fields = {
            name: data.name,
            email: data.email,
            telefon: data.telefon,
            fachgebiet: data.fachgebiet,
          };
          if (editingItem) {
            await LivingAppsService.updateDozentenEntry(editingItem.record_id, fields);
          } else {
            await LivingAppsService.createDozentenEntry(fields);
          }
          setDozenten(await LivingAppsService.getDozenten());
          break;
        }
        case 'teilnehmer': {
          const fields = {
            name: data.name,
            email: data.email,
            telefon: data.telefon,
            geburtsdatum: data.geburtsdatum,
          };
          if (editingItem) {
            await LivingAppsService.updateTeilnehmerEntry(editingItem.record_id, fields);
          } else {
            await LivingAppsService.createTeilnehmerEntry(fields);
          }
          setTeilnehmer(await LivingAppsService.getTeilnehmer());
          break;
        }
        case 'raeume': {
          const fields = {
            raumname: data.raumname,
            gebaeude: data.gebaeude,
            kapazitaet: data.kapazitaet,
          };
          if (editingItem) {
            await LivingAppsService.updateRaeumeEntry(editingItem.record_id, fields);
          } else {
            await LivingAppsService.createRaeumeEntry(fields);
          }
          setRaeume(await LivingAppsService.getRaeume());
          break;
        }
        case 'kurse': {
          const fields = {
            titel: data.titel,
            beschreibung: data.beschreibung,
            startdatum: data.startdatum,
            enddatum: data.enddatum,
            max_teilnehmer: data.max_teilnehmer,
            preis: data.preis,
            dozent: data.dozent_id ? createRecordUrl(APP_IDS.DOZENTEN, data.dozent_id) : undefined,
            raum: data.raum_id ? createRecordUrl(APP_IDS.RAEUME, data.raum_id) : undefined,
          };
          if (editingItem) {
            await LivingAppsService.updateKurseEntry(editingItem.record_id, fields);
          } else {
            await LivingAppsService.createKurseEntry(fields);
          }
          setKurse(await LivingAppsService.getKurse());
          break;
        }
        case 'anmeldungen': {
          const fields = {
            teilnehmer: data.teilnehmer_id ? createRecordUrl(APP_IDS.TEILNEHMER, data.teilnehmer_id) : undefined,
            kurs: data.kurs_id ? createRecordUrl(APP_IDS.KURSE, data.kurs_id) : undefined,
            anmeldedatum: data.anmeldedatum,
            bezahlt: data.bezahlt,
          };
          if (editingItem) {
            await LivingAppsService.updateAnmeldungenEntry(editingItem.record_id, fields);
          } else {
            await LivingAppsService.createAnmeldungenEntry(fields);
          }
          setAnmeldungen(await LivingAppsService.getAnmeldungen());
          break;
        }
      }
      setShowForm(false);
    } catch (err) {
      console.error('Error saving:', err);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const getDozentName = (url: string | undefined) => {
    const id = extractRecordId(url);
    return dozenten.find(d => d.record_id === id)?.fields.name || '-';
  };

  const getTeilnehmerName = (url: string | undefined) => {
    const id = extractRecordId(url);
    return teilnehmer.find(t => t.record_id === id)?.fields.name || '-';
  };

  const getKursTitel = (url: string | undefined) => {
    const id = extractRecordId(url);
    return kurse.find(k => k.record_id === id)?.fields.titel || '-';
  };

  const getRaumName = (url: string | undefined) => {
    const id = extractRecordId(url);
    return raeume.find(r => r.record_id === id)?.fields.raumname || '-';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 header-gradient text-sidebar-foreground flex flex-col z-10">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Kursverwaltung</h1>
              <p className="text-xs text-sidebar-foreground/60">Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab w-full ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/50">
            {stats.bezahlt} von {stats.anmeldungen} Anmeldungen bezahlt
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Stats Header */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {tabs.map((tab) => (
            <div key={tab.id} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className={`badge-${tab.id}`}>{tab.label}</span>
                <tab.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="stat-value">{stats[tab.id]}</div>
              <div className="stat-label">Einträge</div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="card-elevated">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 w-64"
                />
              </div>
              <button onClick={handleAdd} className="btn-accent">
                <Plus className="w-4 h-4" />
                Neu
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="fade-in">
            {activeTab === 'dozenten' && (
              <DozentenTable
                data={dozenten.filter(d =>
                  (d.fields.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                  (d.fields.fachgebiet?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            {activeTab === 'teilnehmer' && (
              <TeilnehmerTable
                data={teilnehmer.filter(t =>
                  (t.fields.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                  (t.fields.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            {activeTab === 'raeume' && (
              <RaeumeTable
                data={raeume.filter(r =>
                  (r.fields.raumname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                  (r.fields.gebaeude?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            {activeTab === 'kurse' && (
              <KurseTable
                data={kurse.filter(k =>
                  (k.fields.titel?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                )}
                getDozentName={getDozentName}
                getRaumName={getRaumName}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            {activeTab === 'anmeldungen' && (
              <AnmeldungenTable
                data={anmeldungen}
                getTeilnehmerName={getTeilnehmerName}
                getKursTitel={getKursTitel}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <FormModal
          tab={activeTab}
          item={editingItem}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
          dozenten={dozenten}
          teilnehmer={teilnehmer}
          kurse={kurse}
          raeume={raeume}
          saving={saving}
        />
      )}
    </div>
  );
}

// Table Components
function DozentenTable({ data, onEdit, onDelete }: {
  data: Dozenten[];
  onEdit: (item: Dozenten) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>E-Mail</th>
          <th>Telefon</th>
          <th>Fachgebiet</th>
          <th className="w-24">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.record_id}>
            <td className="font-medium">{item.fields.name}</td>
            <td>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {item.fields.email}
              </div>
            </td>
            <td>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {item.fields.telefon}
              </div>
            </td>
            <td><span className="badge-dozenten">{item.fields.fachgebiet}</span></td>
            <td>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(item)} className="btn-ghost p-2">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item.record_id)} className="btn-ghost p-2 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center py-12 text-muted-foreground">
              Keine Dozenten gefunden
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function TeilnehmerTable({ data, onEdit, onDelete }: {
  data: Teilnehmer[];
  onEdit: (item: Teilnehmer) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>E-Mail</th>
          <th>Telefon</th>
          <th>Geburtsdatum</th>
          <th className="w-24">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.record_id}>
            <td className="font-medium">{item.fields.name}</td>
            <td>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {item.fields.email}
              </div>
            </td>
            <td>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {item.fields.telefon}
              </div>
            </td>
            <td>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {item.fields.geburtsdatum ? format(new Date(item.fields.geburtsdatum), 'dd.MM.yyyy', { locale: de }) : '-'}
              </div>
            </td>
            <td>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(item)} className="btn-ghost p-2">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item.record_id)} className="btn-ghost p-2 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center py-12 text-muted-foreground">
              Keine Teilnehmer gefunden
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function RaeumeTable({ data, onEdit, onDelete }: {
  data: Raeume[];
  onEdit: (item: Raeume) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Raumname</th>
          <th>Gebäude</th>
          <th>Kapazität</th>
          <th className="w-24">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.record_id}>
            <td className="font-medium">{item.fields.raumname}</td>
            <td>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                {item.fields.gebaeude}
              </div>
            </td>
            <td>
              <span className="badge-raeume">{item.fields.kapazitaet} Plätze</span>
            </td>
            <td>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(item)} className="btn-ghost p-2">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item.record_id)} className="btn-ghost p-2 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={4} className="text-center py-12 text-muted-foreground">
              Keine Räume gefunden
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function KurseTable({ data, getDozentName, getRaumName, onEdit, onDelete }: {
  data: Kurse[];
  getDozentName: (url: string | undefined) => string;
  getRaumName: (url: string | undefined) => string;
  onEdit: (item: Kurse) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Titel</th>
          <th>Zeitraum</th>
          <th>Dozent</th>
          <th>Raum</th>
          <th>Teilnehmer</th>
          <th>Preis</th>
          <th className="w-24">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.record_id}>
            <td>
              <div>
                <div className="font-medium">{item.fields.titel}</div>
                <div className="text-xs text-muted-foreground">{item.fields.beschreibung}</div>
              </div>
            </td>
            <td>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" />
                {item.fields.startdatum && format(new Date(item.fields.startdatum), 'dd.MM.yy', { locale: de })} - {item.fields.enddatum && format(new Date(item.fields.enddatum), 'dd.MM.yy', { locale: de })}
              </div>
            </td>
            <td><span className="badge-dozenten">{getDozentName(item.fields.dozent)}</span></td>
            <td><span className="badge-raeume">{getRaumName(item.fields.raum)}</span></td>
            <td><span className="badge-teilnehmer">max. {item.fields.max_teilnehmer}</span></td>
            <td>
              <div className="flex items-center gap-1 font-semibold">
                <Euro className="w-4 h-4" />
                {item.fields.preis}
              </div>
            </td>
            <td>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(item)} className="btn-ghost p-2">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item.record_id)} className="btn-ghost p-2 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center py-12 text-muted-foreground">
              Keine Kurse gefunden
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function AnmeldungenTable({ data, getTeilnehmerName, getKursTitel, onEdit, onDelete }: {
  data: Anmeldungen[];
  getTeilnehmerName: (url: string | undefined) => string;
  getKursTitel: (url: string | undefined) => string;
  onEdit: (item: Anmeldungen) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Teilnehmer</th>
          <th>Kurs</th>
          <th>Anmeldedatum</th>
          <th>Status</th>
          <th className="w-24">Aktionen</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.record_id}>
            <td><span className="badge-teilnehmer">{getTeilnehmerName(item.fields.teilnehmer)}</span></td>
            <td><span className="badge-kurse">{getKursTitel(item.fields.kurs)}</span></td>
            <td>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {item.fields.anmeldedatum && format(new Date(item.fields.anmeldedatum), 'dd.MM.yyyy', { locale: de })}
              </div>
            </td>
            <td>
              {item.fields.bezahlt ? (
                <span className="badge-success flex items-center gap-1 w-fit">
                  <Check className="w-3 h-3" /> Bezahlt
                </span>
              ) : (
                <span className="badge-warning flex items-center gap-1 w-fit">
                  <X className="w-3 h-3" /> Offen
                </span>
              )}
            </td>
            <td>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(item)} className="btn-ghost p-2">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item.record_id)} className="btn-ghost p-2 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center py-12 text-muted-foreground">
              Keine Anmeldungen gefunden
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// Form Modal Component
function FormModal({ tab, item, onSave, onClose, dozenten, teilnehmer, kurse, raeume, saving }: {
  tab: TabId;
  item: any;
  onSave: (data: any) => void;
  onClose: () => void;
  dozenten: Dozenten[];
  teilnehmer: Teilnehmer[];
  kurse: Kurse[];
  raeume: Raeume[];
  saving: boolean;
}) {
  // Initialize form data based on entity type
  const getInitialData = () => {
    if (!item) return {};

    switch (tab) {
      case 'dozenten':
        return { ...item.fields };
      case 'teilnehmer':
        return { ...item.fields };
      case 'raeume':
        return { ...item.fields };
      case 'kurse':
        return {
          ...item.fields,
          dozent_id: extractRecordId(item.fields.dozent),
          raum_id: extractRecordId(item.fields.raum),
        };
      case 'anmeldungen':
        return {
          ...item.fields,
          teilnehmer_id: extractRecordId(item.fields.teilnehmer),
          kurs_id: extractRecordId(item.fields.kurs),
        };
      default:
        return {};
    }
  };

  const [formData, setFormData] = useState(getInitialData());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const update = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card-elevated w-full max-w-lg fade-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-bold">
            {item ? 'Bearbeiten' : 'Neu erstellen'}
          </h3>
          <button onClick={onClose} className="btn-ghost p-2" disabled={saving}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {tab === 'dozenten' && (
            <>
              <div>
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={formData.name || ''} onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">E-Mail</label>
                <input type="email" className="form-input" value={formData.email || ''} onChange={(e) => update('email', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Telefon</label>
                <input type="tel" className="form-input" value={formData.telefon || ''} onChange={(e) => update('telefon', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Fachgebiet</label>
                <input type="text" className="form-input" value={formData.fachgebiet || ''} onChange={(e) => update('fachgebiet', e.target.value)} required />
              </div>
            </>
          )}
          {tab === 'teilnehmer' && (
            <>
              <div>
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={formData.name || ''} onChange={(e) => update('name', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">E-Mail</label>
                <input type="email" className="form-input" value={formData.email || ''} onChange={(e) => update('email', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Telefon</label>
                <input type="tel" className="form-input" value={formData.telefon || ''} onChange={(e) => update('telefon', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Geburtsdatum</label>
                <input type="date" className="form-input" value={formData.geburtsdatum || ''} onChange={(e) => update('geburtsdatum', e.target.value)} required />
              </div>
            </>
          )}
          {tab === 'raeume' && (
            <>
              <div>
                <label className="form-label">Raumname</label>
                <input type="text" className="form-input" value={formData.raumname || ''} onChange={(e) => update('raumname', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Gebäude</label>
                <input type="text" className="form-input" value={formData.gebaeude || ''} onChange={(e) => update('gebaeude', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Kapazität</label>
                <input type="number" className="form-input" value={formData.kapazitaet || ''} onChange={(e) => update('kapazitaet', parseInt(e.target.value))} required />
              </div>
            </>
          )}
          {tab === 'kurse' && (
            <>
              <div>
                <label className="form-label">Titel</label>
                <input type="text" className="form-input" value={formData.titel || ''} onChange={(e) => update('titel', e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Beschreibung</label>
                <textarea className="form-input" rows={3} value={formData.beschreibung || ''} onChange={(e) => update('beschreibung', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Startdatum</label>
                  <input type="date" className="form-input" value={formData.startdatum || ''} onChange={(e) => update('startdatum', e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Enddatum</label>
                  <input type="date" className="form-input" value={formData.enddatum || ''} onChange={(e) => update('enddatum', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Max. Teilnehmer</label>
                  <input type="number" className="form-input" value={formData.max_teilnehmer || ''} onChange={(e) => update('max_teilnehmer', parseInt(e.target.value))} required />
                </div>
                <div>
                  <label className="form-label">Preis (€)</label>
                  <input type="number" className="form-input" value={formData.preis || ''} onChange={(e) => update('preis', parseFloat(e.target.value))} required />
                </div>
              </div>
              <div>
                <label className="form-label">Dozent</label>
                <select className="form-input" value={formData.dozent_id || ''} onChange={(e) => update('dozent_id', e.target.value)} required>
                  <option value="">Bitte wählen...</option>
                  {dozenten.map(d => <option key={d.record_id} value={d.record_id}>{d.fields.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Raum</label>
                <select className="form-input" value={formData.raum_id || ''} onChange={(e) => update('raum_id', e.target.value)} required>
                  <option value="">Bitte wählen...</option>
                  {raeume.map(r => <option key={r.record_id} value={r.record_id}>{r.fields.raumname} ({r.fields.gebaeude})</option>)}
                </select>
              </div>
            </>
          )}
          {tab === 'anmeldungen' && (
            <>
              <div>
                <label className="form-label">Teilnehmer</label>
                <select className="form-input" value={formData.teilnehmer_id || ''} onChange={(e) => update('teilnehmer_id', e.target.value)} required>
                  <option value="">Bitte wählen...</option>
                  {teilnehmer.map(t => <option key={t.record_id} value={t.record_id}>{t.fields.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Kurs</label>
                <select className="form-input" value={formData.kurs_id || ''} onChange={(e) => update('kurs_id', e.target.value)} required>
                  <option value="">Bitte wählen...</option>
                  {kurse.map(k => <option key={k.record_id} value={k.record_id}>{k.fields.titel}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Anmeldedatum</label>
                <input type="date" className="form-input" value={formData.anmeldedatum || ''} onChange={(e) => update('anmeldedatum', e.target.value)} required />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bezahlt"
                  checked={formData.bezahlt || false}
                  onChange={(e) => update('bezahlt', e.target.checked)}
                  className="w-5 h-5 rounded border-border accent-primary"
                />
                <label htmlFor="bezahlt" className="form-label mb-0">Bezahlt</label>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-ghost" disabled={saving}>
              Abbrechen
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
