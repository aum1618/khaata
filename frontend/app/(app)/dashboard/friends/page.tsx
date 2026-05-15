"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Bell,
  Check,
  X,
} from "lucide-react";
import {
  NeoCard,
  NeoInput,
  NeoButton,
  NeoAvatar,
  NeoBadge,
  NeoModal,
  NeoTabs,
} from "@/components/neo-ui";
import { cn, getErrorMessage } from "@/lib/utils";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { FriendBalance } from "@/lib/types";
import { formatCurrency, useCurrency } from "@/lib/currency";
import { toast } from "@/hooks/use-toast";
import { isValidEmail } from "@/lib/validation";
import { strings } from "@/locales/en";

export default function FriendsPage() {
  const initialTab = "friends";
  const { symbol } = useCurrency();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  const [friends, setFriends] = useState<FriendBalance[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  const [requestSent, setRequestSent] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const data = await apiGet("/balances/friends");
      setFriends(data);
    } catch (error) {
      toast({
        title: strings.friends.toasts.loadFriendsFail,
        description: getErrorMessage(
          error,
          strings.friends.toasts.failFallback,
        ),
        variant: "destructive",
      });
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await apiGet("/friends/requests/pending");
      setRequests(data);
    } catch (error) {
      toast({
        title: strings.friends.toasts.loadRequestsFail,
        description: getErrorMessage(
          error,
          strings.friends.toasts.failFallback,
        ),
        variant: "destructive",
      });
    }
  };

  const handleSearchUser = async () => {
    const email = searchEmail.trim();
    if (!email) {
      setSearchError(strings.friends.addModal.errors.emailMissing);
      return;
    }
    if (!isValidEmail(email)) {
      setSearchError(strings.friends.addModal.errors.emailInvalid);
      return;
    }
    setSearching(true);
    setSearchError("");
    setFoundUser(null);
    try {
      const data = await apiGet(
        `/friends/search?email=${encodeURIComponent(email)}`,
      );
      if (data?.isFriend) {
        setSearchError(strings.friends.addModal.errors.alreadyConnected);
      } else if (data?.hasPendingRequest) {
        setSearchError(strings.friends.addModal.errors.pending);
      }
      setFoundUser(data?.user || data);
    } catch (error) {
      const message = getErrorMessage(
        error,
        strings.friends.addModal.errors.notFoundFallback,
      );
      setSearchError(message);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundUser?._id) return;
    try {
      await apiPost(`/friends/request/${foundUser._id}`, {});
      setRequestSent(true);
      fetchRequests();
      toast({
        title: strings.friends.toasts.requestSentTitle,
        description: strings.friends.toasts.requestSentDescription(
          foundUser.name || "that user",
        ),
      });
    } catch (error) {
      toast({
        title: strings.friends.toasts.requestFailTitle,
        description: getErrorMessage(
          error,
          strings.friends.toasts.failFallback,
        ),
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await apiPut(`/friends/request/${requestId}/accept`, {});
      fetchRequests();
      fetchFriends();
      toast({
        title: strings.friends.toasts.acceptTitle,
        description: strings.friends.toasts.acceptDescription,
      });
    } catch (error) {
      toast({
        title: strings.friends.toasts.acceptFailTitle,
        description: getErrorMessage(
          error,
          strings.friends.toasts.failFallback,
        ),
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await apiPut(`/friends/request/${requestId}/reject`, {});
      fetchRequests();
      toast({
        title: strings.friends.toasts.rejectTitle,
        description: strings.friends.toasts.rejectDescription,
      });
    } catch (error) {
      toast({
        title: strings.friends.toasts.rejectFailTitle,
        description: getErrorMessage(
          error,
          strings.friends.toasts.failFallback,
        ),
        variant: "destructive",
      });
    }
  };

  const filteredFriends = friends.filter(
    (entry) =>
      entry.friend?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.friend?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tabs = [
    {
      id: "friends",
      label: strings.friends.title,
      icon: <UserPlus className="w-4 h-4" />,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {strings.friends.title}
          </h1>
          <p className="text-gray-600">{strings.friends.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NeoButton
            variant="secondary"
            onClick={() => setShowRequestsModal(true)}
            className="relative"
          >
            <Bell className="w-4 h-4" />
            {strings.friends.requestsButton}
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {requests.length}
              </span>
            )}
          </NeoButton>
          <NeoButton
            variant="accent"
            onClick={() => setShowAddFriendModal(true)}
          >
            <UserPlus className="w-4 h-4" />
            {strings.friends.addFriendButton}
          </NeoButton>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <NeoInput
          placeholder={strings.friends.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <NeoCard shadow="none" className="overflow-hidden">
        <NeoTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </NeoCard>

      {/* Content */}
      {activeTab === "friends" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <NeoCard className="p-4 text-center" shadow="sm">
              <p className="text-2xl font-bold">{friends.length}</p>
              <p className="text-sm text-gray-600">
                {strings.friends.summaryTotal}
              </p>
            </NeoCard>
            <NeoCard className="p-4 text-center bg-accent" shadow="sm">
              <p className="text-2xl font-bold">
                {friends.filter((f) => f.balance > 0).length}
              </p>
              <p className="text-sm">{strings.friends.summaryOweYou}</p>
            </NeoCard>
            <NeoCard className="p-4 text-center bg-secondary" shadow="sm">
              <p className="text-2xl font-bold">
                {friends.filter((f) => f.balance < 0).length}
              </p>
              <p className="text-sm">{strings.friends.summaryYouOwe}</p>
            </NeoCard>
          </div>

          {/* Friends List */}
          <NeoCard shadow="md">
            <div className="divide-y-2 divide-black">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friendShip) => {
                  const friend = friendShip.friend;
                  if (!friend) return null;
                  return (
                    <Link
                      key={friend._id || friend.id}
                      href={`/dashboard/friends/${friend._id || friend.id}`}
                      className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <NeoAvatar name={friend.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {friend.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {friendShip.balance !== 0 &&
                          friendShip.balance !== undefined && (
                            <div
                              className={cn(
                                "flex items-center gap-1 font-bold",
                                friendShip.balance > 0
                                  ? "text-green-600"
                                  : "text-red-600",
                              )}
                            >
                              {friendShip.balance > 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                              {formatCurrency(friendShip.balance, symbol, {
                                absolute: true,
                              })}
                            </div>
                          )}
                        {(friendShip.balance === 0 ||
                          friendShip.balance === undefined) && (
                          <NeoBadge variant="default">
                            {strings.friends.settled}
                          </NeoBadge>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {strings.friends.noMatches}
                </div>
              )}
            </div>
          </NeoCard>
        </div>
      )}

      {/* Add Friend Modal */}
      <NeoModal
        open={showAddFriendModal}
        onClose={() => {
          setShowAddFriendModal(false);
          setSearchEmail("");
          setFoundUser(null);
          setSearchError("");
          setRequestSent(false);
        }}
        title={strings.friends.addModal.title}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {strings.friends.addModal.emailLabel}
            </label>
            <div className="flex gap-2">
              <NeoInput
                type="email"
                placeholder={strings.friends.addModal.emailPlaceholder}
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <NeoButton
                variant="secondary"
                onClick={handleSearchUser}
                disabled={searching}
              >
                {searching
                  ? strings.friends.addModal.searchLoading
                  : strings.friends.addModal.searchAction}
              </NeoButton>
            </div>
          </div>

          {searchError && (
            <div className="text-sm text-red-600">{searchError}</div>
          )}

          {foundUser && (
            <NeoCard className="p-3" shadow="sm">
              <div className="flex items-center gap-3">
                <NeoAvatar name={foundUser.name || "User"} size="sm" />
                <div className="flex-1">
                  <p className="font-bold text-sm">
                    {foundUser.name || strings.friends.addModal.userFallback}
                  </p>
                  <p className="text-xs text-gray-500">
                    {foundUser.email || ""}
                  </p>
                </div>
              </div>
            </NeoCard>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <NeoButton
              variant={requestSent ? "secondary" : "accent"}
              onClick={handleSendRequest}
              disabled={requestSent || !foundUser || !!searchError}
            >
              {requestSent
                ? strings.friends.addModal.sent
                : strings.friends.addModal.sendRequest}
            </NeoButton>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-black">
            <NeoButton
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowAddFriendModal(false);
                setSearchEmail("");
                setFoundUser(null);
                setSearchError("");
                setRequestSent(false);
              }}
            >
              {strings.friends.addModal.close}
            </NeoButton>
          </div>
        </div>
      </NeoModal>

      {/* Friend Requests Modal */}
      <NeoModal
        open={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
        title={strings.friends.requestsModal.title}
      >
        <div className="space-y-4">
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req._id || req.id}
                  className="border-2 border-black rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <NeoAvatar name={req.requester?.name || "User"} size="sm" />
                    <div>
                      <p className="font-bold text-sm">
                        {req.requester?.name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {req.requester?.email || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <NeoButton
                      variant="ghost"
                      className="p-2 h-auto"
                      onClick={() => handleRejectRequest(req._id || req.id)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </NeoButton>
                    <NeoButton
                      variant="accent"
                      className="p-2 h-auto"
                      onClick={() => handleAcceptRequest(req._id || req.id)}
                    >
                      <Check className="w-4 h-4" />
                    </NeoButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {strings.friends.requestsModal.empty}
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t-2 border-black">
            <NeoButton
              variant="ghost"
              className="flex-1"
              onClick={() => setShowRequestsModal(false)}
            >
              {strings.common.close}
            </NeoButton>
          </div>
        </div>
      </NeoModal>
    </div>
  );
}
