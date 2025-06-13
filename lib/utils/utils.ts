// web/app/(main)/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Calendar, Shield,
  Edit3, Camera, Save, X, LogOut, Bell, Moon,
  Globe, Heart, Award, TrendingUp, Book, Clock,
  Flame, Church, Star, ChevronRight, Settings,
  CreditCard, Download, Share2, Lock, Users
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassSelect } from '@/components/glass/GlassSelect'
import GlassModal from '@/components/glass/GlassModal'
import Image from 'next/image'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { getUserProfile, updateProfile } from '@/lib/supabase/queries'
import { signOut } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

// Profile sections
const sections = [
  { id: 'overview', name: 'Przegląd', icon: User },
  { id: 'activity', name: 'Aktywność', icon: TrendingUp },
  { id: 'achievements', name: 'Osiągnięcia', icon: Award },
  { id: 'settings', name: 'Ustawienia', icon: Settings }
]

// User achievements
const achievements = [
  {
    id: '1',
    title: 'Pierwsza świeca',
    description: 'Zapaliłeś swoją pierwszą świecę',
    icon: Flame,
    unlocked: true,
    date: new Date(Date.now() - 3600000 * 24 * 30)
  },
  {
    id: '2',
    title: 'Tydzień modlitwy',
    description: '7 dni nieprzerwanej modlitwy',
    icon: Heart,
    unlocked: true,
    date: new Date(Date.now() - 3600000 * 24 * 7)
  },
  {
    id: '3',
    title: 'Miesiąc w OREMUS',
    description: 'Jesteś z nami od miesiąca',
    icon: Calendar,
    unlocked: true,
    date: new Date(Date.now() - 3600000 * 24)
  },
  {
    id: '4',
    title: 'Lider wspólnoty',
    description: 'Założyłeś własną grupę modlitewną',
    icon: Users,
    unlocked: false
  },
  {
    id: '5',
    title: 'Pielgrzym',
    description: 'Uczestniczyłeś w 10 transmisjach Mszy',
    icon: Church,
    unlocked: false
  },
  {
    id: '6',
    title: 'Mistrz duchowości',
    description: 'Ukończyłeś 5 kursów w Akademii',
    icon: Book,
    unlocked: false
  }
]

// Activity stats
const activityData = {
  prayers: [
    { date: 'Pon', count: 3 },
    { date: 'Wt', count: 2 },
    { date: 'Śr', count: 4 },
    { date: 'Czw', count: 1 },
    { date: 'Pt', count: 5 },
    { date: 'Sob', count: 3 },
    { date: 'Ndz', count: 6 }
  ],
  totalPrayers: 156,
  totalCandles: 89,
  totalMasses: 23,
  streak: 7
}

export default function ProfilePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    diocese: '',
    bio: ''
  })
  const [settings, setSettings] = useState({
    notifications: {
      prayer_reminders: true,
      mass_notifications: true,
      community_updates: false,
      newsletter: true
    },
    privacy: {
      show_profile: true,
      show_activity: true,
      allow_messages: false
    },
    appearance: {
      dark_mode: true,
      language: 'pl'
    }
  })

  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await getUserProfile()
      setProfile(data)
      setEditForm({
        full_name: data.full_name || '',
        phone: data.phone || '',
        diocese: data.diocese || '',
        bio: data.bio || ''
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Nie udało się załadować profilu')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(editForm)
      setProfile({ ...profile, ...editForm })
      setIsEditing(false)
      toast.success('Profil zaktualizowany')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Nie udało się zaktualizować profilu')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Błąd podczas wylogowania')
    }
  }

  const updateSetting = (category: string, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
    toast.success('Ustawienia zapisane')
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8 flex items-center justify-center">
        <div className="animate-pulse text-white">Ładowanie...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-glass-secondary">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Avatar'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 md:w-16 md:h-16 text-secondary" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-secondary rounded-full text-primary hover:bg-secondary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <GlassInput
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      placeholder="Imię i nazwisko"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GlassInput
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="Telefon"
                        icon={<Phone className="w-5 h-5" />}
                      />
                      <GlassSelect
                        value={editForm.diocese}
                        onChange={(e) => setEditForm({ ...editForm, diocese: e.target.value })}
                        options={[
                          { value: '', label: 'Wybierz diecezję' },
                          { value: 'warszawa', label: 'Archidiecezja Warszawska' },
                          { value: 'krakow', label: 'Archidiecezja Krakowska' },
                          { value: 'poznan', label: 'Archidiecezja Poznańska' },
                          { value: 'gdansk', label: 'Archidiecezja Gdańska' },
                          { value: 'czestochowa', label: 'Archidiecezja Częstochowska' }
                        ]}
                      />
                    </div>
                    <GlassInput
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Krótki opis o sobie..."
                      multiline
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {profile?.full_name || 'Użytkownik OREMUS'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/70">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{profile?.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile?.diocese && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.diocese}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Dołączył: {format(new Date(profile?.created_at || Date.now()), 'MMMM yyyy', { locale: pl })}</span>
                      </div>
                    </div>
                    {profile?.bio && (
                      <p className="mt-3 text-white/80">{profile.bio}</p>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <GlassButton
                      onClick={handleUpdateProfile}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Zapisz
                    </GlassButton>
                    <GlassButton
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false)
                        setEditForm({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || '',
                          diocese: profile?.diocese || '',
                          bio: profile?.bio || ''
                        })
                      }}
                    >
                      <X className="w-4 h-4" />
                    </GlassButton>
                  </>
                ) : (
                  <GlassButton
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edytuj profil
                  </GlassButton>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Section Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              
              return (
                <GlassButton
                  key={section.id}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setActiveSection(section.id)}
                  className="gap-2 whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {section.name}
                </GlassButton>
              )
            })}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="p-6 text-center">
                <Flame className="w-10 h-10 text-secondary mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {activityData.totalCandles}
                </div>
                <p className="text-white/70">Zapalonych świec</p>
              </GlassCard>
              
              <GlassCard className="p-6 text-center">
                <Heart className="w-10 h-10 text-prayer mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {activityData.totalPrayers}
                </div>
                <p className="text-white/70">Modlitw</p>
              </GlassCard>
              
              <GlassCard className="p-6 text-center">
                <Church className="w-10 h-10 text-mass mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {activityData.totalMasses}
                </div>
                <p className="text-white/70">Mszy online</p>
              </GlassCard>
              
              <GlassCard className="p-6 text-center">
                <TrendingUp className="w-10 h-10 text-academy mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {activityData.streak}
                </div>
                <p className="text-white/70">Dni z rzędu</p>
              </GlassCard>
            </div>
          )}

          {/* Activity Section */}
          {activeSection === 'activity' && (
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Twoja aktywność modlitewna</h3>
              
              {/* Activity Chart */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4">Modlitwy w tym tygodniu</h4>
                <div className="flex items-end gap-2 h-40 bg-glass-primary rounded-lg p-4">
                  {activityData.prayers.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        className="w-full bg-secondary rounded-t min-h-[4px]"
                        initial={{ height: 4 }}
                        animate={{ height: `${Math.max(4, (day.count / 6) * 120)}px` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      />
                      <span className="text-xs text-white/70">{day.date}</span>
                      <span className="text-xs text-white font-semibold">{day.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity List */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Ostatnia aktywność</h4>
                <div className="space-y-3">
                  {[
                    { type: 'prayer', title: 'Modlitwa poranna', time: '2 godziny temu', icon: Heart },
                    { type: 'candle', title: 'Zapaliłeś świecę za babcię', time: '5 godzin temu', icon: Flame },
                    { type: 'mass', title: 'Udział w Mszy świętej online', time: 'wczoraj', icon: Church },
                    { type: 'achievement', title: 'Zdobyłeś osiągnięcie "Tydzień modlitwy"', time: '2 dni temu', icon: Award }
                  ].map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-glass-primary rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.title}</p>
                          <p className="text-white/60 text-sm">{activity.time}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Achievements Section */}
          {activeSection === 'achievements' && (
            <div className="space-y-6">
              {/* Unlocked Achievements */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Zdobyte osiągnięcia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.filter(achievement => achievement.unlocked).map((achievement) => {
                    const Icon = achievement.icon
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-glass-primary rounded-lg border border-secondary/30"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{achievement.title}</h4>
                            <p className="text-white/60 text-sm">
                              {achievement.date && format(achievement.date, 'dd MMMM yyyy', { locale: pl })}
                            </p>
                          </div>
                        </div>
                        <p className="text-white/70 text-sm">{achievement.description}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </GlassCard>

              {/* Locked Achievements */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Do zdobycia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.filter(achievement => !achievement.unlocked).map((achievement) => {
                    const Icon = achievement.icon
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-glass-primary rounded-lg opacity-60"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white/70">{achievement.title}</h4>
                            <p className="text-white/40 text-sm">Zablokowane</p>
                          </div>
                        </div>
                        <p className="text-white/50 text-sm">{achievement.description}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              {/* Notifications */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  Powiadomienia
                </h3>
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-white font-medium">
                          {key === 'prayer_reminders' && 'Przypomnienia o modlitwie'}
                          {key === 'mass_notifications' && 'Powiadomienia o Mszach'}
                          {key === 'community_updates' && 'Aktualności wspólnoty'}
                          {key === 'newsletter' && 'Newsletter'}
                        </p>
                        <p className="text-white/60 text-sm">
                          {key === 'prayer_reminders' && 'Otrzymuj przypomnienia o codziennej modlitwie'}
                          {key === 'mass_notifications' && 'Powiadom o rozpoczęciu transmisji Mszy'}
                          {key === 'community_updates' && 'Informacje o wydarzeniach w Twojej wspólnocie'}
                          {key === 'newsletter' && 'Cotygodniowy newsletter z inspiracjami'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={value}
                          onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Privacy */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Prywatność
                </h3>
                <div className="space-y-4">
                  {Object.entries(settings.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-white font-medium">
                          {key === 'show_profile' && 'Widoczność profilu'}
                          {key === 'show_activity' && 'Widoczność aktywności'}
                          {key === 'allow_messages' && 'Wiadomości prywatne'}
                        </p>
                        <p className="text-white/60 text-sm">
                          {key === 'show_profile' && 'Pozwól innym użytkownikom na przeglądanie Twojego profilu'}
                          {key === 'show_activity' && 'Pokaż swoją aktywność modlitewną innym'}
                          {key === 'allow_messages' && 'Pozwól innym na wysyłanie wiadomości prywatnych'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={value}
                          onChange={(e) => updateSetting('privacy', key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Account Actions */}
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Zarządzanie kontem</h3>
                <div className="space-y-3">
                  <GlassButton
                    variant="secondary"
                    className="w-full justify-between"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Zmień hasło
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </GlassButton>
                  
                  <GlassButton
                    variant="secondary"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Pobierz moje dane
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </GlassButton>
                  
                  <GlassButton
                    variant="secondary"
                    className="w-full justify-between text-red-400 hover:bg-red-500/10"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5" />
                      Usuń konto
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </GlassButton>
                  
                  <GlassButton
                    variant="secondary"
                    className="w-full justify-between mt-6"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-5 h-5" />
                      Wyloguj się
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          )}
        </motion.div>
      </div>

      {/* Password Change Modal */}
      <GlassModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Zmień hasło"
      >
        <div className="space-y-4">
          <GlassInput
            type="password"
            placeholder="Obecne hasło"
            icon={<Lock className="w-5 h-5" />}
          />
          <GlassInput
            type="password"
            placeholder="Nowe hasło"
            icon={<Lock className="w-5 h-5" />}
          />
          <GlassInput
            type="password"
            placeholder="Potwierdź nowe hasło"
            icon={<Lock className="w-5 h-5" />}
          />
          <div className="flex gap-3 pt-4">
            <GlassButton
              onClick={() => {
                toast.success('Hasło zostało zmienione')
                setShowPasswordModal(false)
              }}
              className="flex-1"
            >
              Zmień hasło
            </GlassButton>
            <GlassButton
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
            >
              Anuluj
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Delete Account Modal */}
      <GlassModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Usuń konto"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">
              <strong>Uwaga!</strong> Ta akcja jest nieodwracalna. Wszystkie Twoje dane, 
              modlitwy, świece i osiągnięcia zostaną trwale usunięte.
            </p>
          </div>
          <p className="text-white/70">
            Aby potwierdzić usunięcie konta, wpisz swoje hasło:
          </p>
          <GlassInput
            type="password"
            placeholder="Twoje hasło"
            icon={<Lock className="w-5 h-5" />}
          />
          <div className="flex gap-3 pt-4">
            <GlassButton
              onClick={() => {
                toast.error('Konto zostało usunięte')
                setShowDeleteModal(false)
                // Tutaj dodaj logikę usuwania konta
              }}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              Usuń konto
            </GlassButton>
            <GlassButton
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Anuluj
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  )
}