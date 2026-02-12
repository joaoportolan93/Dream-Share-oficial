import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSuggestedUsers, followUser, unfollowUser } from '../services/api';

const SuggestionsContext = createContext(null);

/**
 * Provider that fetches suggested users ONCE and shares
 * the data + follow actions across all consumers.
 */
export const SuggestionsProvider = ({ children }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followingIds, setFollowingIds] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) {
            setLoading(false);
            return;
        }
        const fetch = async () => {
            try {
                const response = await getSuggestedUsers();
                setSuggestions(response.data || []);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const toggleFollow = useCallback(async (userId) => {
        const isFollowing = followingIds.includes(userId);
        // Optimistic update
        setFollowingIds(prev =>
            isFollowing ? prev.filter(id => id !== userId) : [...prev, userId]
        );
        try {
            if (isFollowing) {
                await unfollowUser(userId);
            } else {
                await followUser(userId);
            }
        } catch (err) {
            // Revert on error
            setFollowingIds(prev =>
                isFollowing ? [...prev, userId] : prev.filter(id => id !== userId)
            );
        }
    }, [followingIds]);

    return (
        <SuggestionsContext.Provider value={{ suggestions, loading, followingIds, toggleFollow }}>
            {children}
        </SuggestionsContext.Provider>
    );
};

export const useSuggestions = () => {
    const ctx = useContext(SuggestionsContext);
    if (!ctx) {
        return { suggestions: [], loading: false, followingIds: [], toggleFollow: () => { } };
    }
    return ctx;
};
