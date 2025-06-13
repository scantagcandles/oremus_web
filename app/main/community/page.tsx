// web/app/(main)/community/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, MessageCircle, Calendar, MapPin, Heart, 
  Plus, Search, Filter, ChevronRight, Star, Globe,
  Clock, UserPlus, Bell, Share2, Camera, Send,
  Sparkles, Shield, Award, TrendingUp
} from 'lucide-react'
import GlassCard from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { GlassTextarea } from '@/components/glass/GlassTextarea'
import { GlassSelect } from '@/components/glass/GlassSelect'
import GlassModal from '@/components/glass/GlassModal'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

// Group categories
const categories = [
  { id: 'all', name: 'Wszystkie', icon: Globe },
  { id: 'prayer', name: 'Grupy modlitewne', icon: Users },
  { id: 'rosary', name: 'Różaniec', icon: Heart },
  { id: 'bible', name: 'Studium Biblijne', icon: Star },
  { id: 'youth', name: 'Młodzież', icon: Sparkles },
  { id: 'family', name: 'Rodziny', icon: Shield },
  { id: 'local', name: 'Lokalne', icon: MapPin }
]

// Groups data
const groups = [
  {
    id: '1',
    name: 'Wspólnota Różańcowa Online',
    description: 'Codziennie o 20:00 odmawiamy różaniec przez internet',
    category: 'rosary',
    members: 1234,
    image: 'https://images.unsplash.com/photo-1605982048179-91970d0d3201',
    isPublic: true,
    isVerified: true,
    nextEvent: {
      title: 'Różaniec - Tajemnice Radosne',
      date: new Date(Date.now() + 3600000 * 3),
      attendees: 45
    },
    admin: {
      name: 'Maria Kowalska',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'
    },
    tags: ['różaniec', 'modlitwa', 'codziennie']
  },
  {
    id: '2',
    name: 'Młodzi w Drodze',
    description: 'Grupa dla młodzieży szukającej swojej drogi do Boga',
    category: 'youth',
    members: 876,
    image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df',
    isPublic: true,
    isFeatured: true,
    nextEvent: {
      title: 'Spotkanie formacyjne online',
      date: new Date(Date.now() + 3600000 * 24),
      attendees: 120
    },
    admin: {
      name: 'ks. Piotr Nowak',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
    },
    tags: ['młodzież', 'formacja', 'spotkania']
  },
  {
    id: '3',
    name: 'Biblijna Podróż',
    description: 'Wspólnie czytamy i rozważamy Pismo Święte',
    category: 'bible',
    members: 543,
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65',
    isPublic: false,
    requiresApproval: true,
    nextEvent: {
      title: 'List do Rzymian - rozdział 8',
      date: new Date(Date.now() + 3600000 * 48),
      attendees: 67
    },
    admin: {
      name: 'prof. Jan Wiśniewski',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
    },
    tags: ['biblia', 'studium', 'teologia']
  },
  {
    id: '4',
    name: 'Rodziny w Wierze',
    description: 'Wsparcie dla rodzin katolickich',
    category: 'family',
    members: 2156,
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300',
    isPublic: true,
    isVerified: true,
    nextEvent: {
      title: 'Warsztaty: Wychowanie w wierze',
      date: new Date(Date.now() + 3600000 * 72),
      attendees: 89
    },
    admin: {
      name: 'Anna i Paweł Kowalscy',
      avatar: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a'
    },
    tags: ['rodzina', 'wychowanie', 'małżeństwo']
  }
]

// Events data
const upcomingEvents = [
  {
    id: '1',
    title: 'Nocna Adoracja Online',
    group: 'Wspólnota OREMUS',
    date: new Date(Date.now() + 3600000 * 6),
    type: 'online',
    attendees: 234,
    image: 'https://images.unsplash.com/photo-1559882869-0aa7e65ce3da'
  },
  {
    id: '2',
    title: 'Spotkanie Młodych - Warszawa',
    group: 'Młodzi w Drodze',
    date: new Date(Date.now() + 3600000 * 24 * 3),
    type: 'hybrid',
    location: 'Warszawa, ul. Świętojańska 12',
    attendees: 156,
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94'
  },
  {
    id: '3',
    title: 'Rekolekcje Wielkopostne',
    group: 'Parafia św. Jana',
    date: new Date(Date.now() + 3600000 * 24 * 7),
    type: 'offline',
    location: 'Kraków, Rynek Główny',
    attendees: 89,
    image: 'https://images.unsplash.com/photo-1559559559-e2febf5bad4f'
  }
]

// Forum posts
const forumPosts = [
  {
    id: '1',
    title: 'Jak zacząć codzienną modlitwę?',
    author: 'Marek K.',
    category: 'Modlitwa',
    replies: 23,
    views: 456,
    lastReply: new Date(Date.now() - 3600000),
    isPinned: true
  },
  {
    id: '2',
    title: 'Świadectwo: Moja droga powrotu do wiary',
    author: 'Anna M.',
    category: 'Świadectwa',
    replies: 45,
    views: 1234,
    lastReply: new Date(Date.now() - 3600000 * 3)
  },
  {
    id: '3',
    title: 'Pytanie o sens cierpienia',
    author: 'Tomasz W.',
    category: 'Teologia',
    replies: 67,
    views: 890,
    lastReply: new Date(Date.now() - 3600000 * 12)
  }
]

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'groups' | 'events' | 'forum'>('groups')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showGroupDetails, setShowGroupDetails] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0] | null>(null)
  const [joinedGroups, setJoinedGroups] = useState<string[]>(['1'])
  const [showNewPost, setShowNewPost] = useState(false)

  // Filter groups
  const filteredGroups = groups.filter(group => {
    if (selectedCategory !== 'all' && group.category !== selectedCategory) {
      return false
    }
    if (searchQuery && !group.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !group.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const joinGroup = (groupId: string) => {
    setJoinedGroups(prev => [...prev, groupId])
    toast.success('Dołączono do grupy!')
  }

  const leaveGroup = (groupId: string) => {
    setJoinedGroups(prev => prev.filter(id => id !== groupId))
    toast.success('Opuszczono grupę')
  }

  const openGroupDetails = (group: typeof groups[0]) => {
    setSelectedGroup(group)
    setShowGroupDetails(true)
  }

  // User stats
  const userStats = {
    groups: joinedGroups.length,
    events: 5,
    posts: 12,
    reputation: 234
  }

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Wspólnota OREMUS
          </h1>
          <p className="text-lg text-white/70">
            Znajdź swoją grupę modlitewną i rozwijaj się duchowo
          </p>
        </motion.div>

        {/* User Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <GlassCard className="p-4 text-center">
            <Users className="w-8 h-8 text-info mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.groups}</div>
            <p className="text-sm text-white/70">Twoje grupy</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Calendar className="w-8 h-8 text-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.events}</div>
            <p className="text-sm text-white/70">Wydarzenia</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-prayer mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.posts}</div>
            <p className="text-sm text-white/70">Posty na forum</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Award className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{userStats.reputation}</div>
            <p className="text-sm text-white/70">Reputacja</p>
          </GlassCard>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-2 mb-4">
            <GlassButton
              variant={activeTab === 'groups' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('groups')}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Grupy
            </GlassButton>
            <GlassButton
              variant={activeTab === 'events' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('events')}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Wydarzenia
            </GlassButton>
            <GlassButton
              variant={activeTab === 'forum' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('forum')}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Forum
            </GlassButton>
          </div>

          {/* Search and Filters */}
          {activeTab === 'groups' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <GlassInput
                    placeholder="Szukaj grup..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-5 h-5" />}
                  />
                </div>
                <GlassButton
                  onClick={() => setShowCreateGroup(true)}
                  className="gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Stwórz grupę
                </GlassButton>
              </div>
              
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  const isActive = selectedCategory === category.id
                  
                  return (
                    <GlassButton
                      key={category.id}
                      variant={isActive ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="gap-2 whitespace-nowrap"
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </GlassButton>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group, index) => {
                const isJoined = joinedGroups.includes(group.id)
                
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <GlassCard className="h-full group" hover>
                      <div className="relative">
                        {/* Cover Image */}
                        <div className="relative h-32 overflow-hidden rounded-t-2xl">
                          <Image
                            src={group.image}
                            alt={group.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-2 right-2 flex gap-1">
                            {group.isVerified && (
                              <div className="p-1 bg-blue-500 rounded-full">
                                <Shield className="w-4 h-4 text-white" />
                              </div>
                            )}
                            {group.isFeatured && (
                              <div className="p-1 bg-secondary rounded-full">
                                <Star className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                          
                          {/* Member count */}
                          <div className="absolute bottom-2 left-3 flex items-center gap-1 text-white">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{group.members}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-white mb-1">
                            {group.name}
                          </h3>
                          <p className="text-white/70 text-sm mb-3 line-clamp-2">
                            {group.description}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {group.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-glass-white rounded-full text-white/70"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Next Event */}
                          {group.nextEvent && (
                            <div className="bg-glass-white rounded-lg p-3 mb-3">
                              <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium truncate">
                                    {group.nextEvent.title}
                                  </p>
                                  <p className="text-white/50 text-xs">
                                    {formatDistanceToNow(group.nextEvent.date, {
                                      addSuffix: true,
                                      locale: pl
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Admin */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                              <Image
                                src={group.admin.avatar}
                                alt={group.admin.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-white/50 text-xs">Założyciel:</p>
                              <p className="text-white text-sm">{group.admin.name}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <GlassButton
                              size="sm"
                              className="flex-1"
                              onClick={() => openGroupDetails(group)}
                            >
                              Szczegóły
                            </GlassButton>
                            {isJoined ? (
                              <GlassButton
                                size="sm"
                                variant="secondary"
                                onClick={() => leaveGroup(group.id)}
                              >
                                Opuść
                              </GlassButton>
                            ) : (
                              <GlassButton
                                size="sm"
                                onClick={() => joinGroup(group.id)}
                                disabled={!group.isPublic}
                              >
                                {group.requiresApproval ? 'Poproś o dostęp' : 'Dołącz'}
                              </GlassButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {event.title}
                        </h3>
                        <p className="text-white/70 text-sm mb-2">{event.group}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(event.date, {
                                addSuffix: true,
                                locale: pl
                              })}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees} uczestników</span>
                          </div>
                          
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs font-medium
                            ${event.type === 'online' ? 'bg-blue-500/20 text-blue-400' :
                              event.type === 'hybrid' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-green-500/20 text-green-400'}
                          `}>
                            {event.type === 'online' ? 'Online' :
                             event.type === 'hybrid' ? 'Hybrydowe' : 'Stacjonarne'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <GlassButton size="sm">
                          Wezmę udział
                        </GlassButton>
                        <button className="p-2 rounded-lg hover:bg-glass-white transition-colors">
                          <Share2 className="w-4 h-4 text-white/50" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Forum Tab */}
          {activeTab === 'forum' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Ostatnie dyskusje</h2>
                <GlassButton
                  size="sm"
                  onClick={() => setShowNewPost(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nowy post
                </GlassButton>
              </div>
              
              {forumPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4 hover:bg-glass-white/5 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && (
                            <div className="p-1 bg-secondary rounded">
                              <TrendingUp className="w-3 h-3 text-primary" />
                            </div>
                          )}
                          <span className="text-xs px-2 py-0.5 bg-glass-white rounded-full text-white/70">
                            {post.category}
                          </span>
                        </div>
                        
                        <h3 className="text-white font-medium mb-1">
                          {post.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-white/50">
                          <span>przez {post.author}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.replies} odpowiedzi</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(post.lastReply, {
                                addSuffix: true,
                                locale: pl
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Group Modal */}
        <GlassModal
          isOpen={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          title="Stwórz nową grupę"
          size="md"
        >
          <div className="space-y-4">
            <GlassInput
              label="Nazwa grupy"
              placeholder="np. Młodzi Katolicy Warszawa"
            />
            
            <GlassTextarea
              label="Opis grupy"
              placeholder="Opisz cel i charakter grupy..."
              rows={4}
            />
            
            <GlassSelect
              label="Kategoria"
              options={categories.slice(1).map(cat => ({
                value: cat.id,
                label: cat.name
              }))}
            />
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded bg-glass-white border-glass-white text-secondary focus:ring-secondary"
                  defaultChecked
                />
                <span className="text-white">Grupa publiczna</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded bg-glass-white border-glass-white text-secondary focus:ring-secondary"
                />
                <span className="text-white">Wymagaj zatwierdzenia członków</span>
              </label>
            </div>
            
            <div className="flex gap-3">
              <GlassButton className="flex-1">
                Stwórz grupę
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => setShowCreateGroup(false)}
              >
                Anuluj
              </GlassButton>
            </div>
          </div>
        </GlassModal>

        {/* Group Details Modal */}
        <GlassModal
          isOpen={showGroupDetails}
          onClose={() => setShowGroupDetails(false)}
          title={selectedGroup?.name}
          size="lg"
        >
          {selectedGroup && (
            <div className="space-y-6">
              {/* Header */}
              <div className="relative h-48 rounded-xl overflow-hidden">
                <Image
                  src={selectedGroup.image}
                  alt={selectedGroup.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {selectedGroup.name}
                  </h2>
                  <div className="flex items-center gap-4 text-white/70">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{selectedGroup.members} członków</span>
                    </div>
                    {selectedGroup.isVerified && (
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span>Zweryfikowana</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2">O grupie</h3>
                <p className="text-white/70">{selectedGroup.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedGroup.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 bg-glass-white rounded-full text-white/70"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Admin */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Założyciel</h3>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={selectedGroup.admin.avatar}
                      alt={selectedGroup.admin.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedGroup.admin.name}</p>
                    <p className="text-white/50 text-sm">Administrator grupy</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {joinedGroups.includes(selectedGroup.id) ? (
                  <>
                    <GlassButton className="flex-1">
                      Przejdź do grupy
                    </GlassButton>
                    <GlassButton
                      variant="secondary"
                      onClick={() => {
                        leaveGroup(selectedGroup.id)
                        setShowGroupDetails(false)
                      }}
                    >
                      Opuść grupę
                    </GlassButton>
                  </>
                ) : (
                  <GlassButton
                    className="flex-1"
                    onClick={() => {
                      joinGroup(selectedGroup.id)
                      setShowGroupDetails(false)
                    }}
                  >
                    Dołącz do grupy
                  </GlassButton>
                )}
              </div>
            </div>
          )}
        </GlassModal>

        {/* New Post Modal */}
        <GlassModal
          isOpen={showNewPost}
          onClose={() => setShowNewPost(false)}
          title="Nowy post na forum"
          size="md"
        >
          <div className="space-y-4">
            <GlassInput
              label="Tytuł"
              placeholder="O czym chcesz porozmawiać?"
            />
            
            <GlassSelect
              label="Kategoria"
              options={[
                { value: 'modlitwa', label: 'Modlitwa' },
                { value: 'swiadectwa', label: 'Świadectwa' },
                { value: 'teologia', label: 'Teologia' },
                { value: 'ogolne', label: 'Ogólne' }
              ]}
            />
            
            <GlassTextarea
              label="Treść"
              placeholder="Podziel się swoimi myślami..."
              rows={6}
            />
            
            <div className="flex gap-3">
              <GlassButton className="flex-1 gap-2">
                <Send className="w-4 h-4" />
                Opublikuj
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => setShowNewPost(false)}
              >
                Anuluj
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      </div>
    </div>
  )
}