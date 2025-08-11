const express = require('express');
const { db } = require('../config/firebase-admin');
const { protect: auth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  validateUserId, 
  validateLike, 
  validateProfileUpdate 
} = require('../middleware/validation');
const router = express.Router();

// Get users for discovery (excluding current user and already liked/passed users)
router.get('/discover', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase not available'
      });
    }

    const currentUser = req.user;
    
    // Get users that haven't been liked or passed by current user
    const excludedIds = [
      req.user.id,
      ...(currentUser.likedUsers || []),
      ...(currentUser.passedUsers || [])
    ];
    
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const userId = doc.id;
      
      // Filter out excluded users and apply age preferences
      if (!excludedIds.includes(userId) && 
          userData.age >= (currentUser.agePreference?.min || 18) &&
          userData.age <= (currentUser.agePreference?.max || 100)) {
        users.push({
          id: userId,
          uid: userId,
          name: userData.name,
          age: userData.age,
          location: userData.location,
          genderIdentity: userData.genderIdentity,
          sexualOrientation: userData.sexualOrientation,
          bio: userData.bio,
          interests: userData.interests,
          profilePhoto: userData.profilePhoto,
          lastActive: userData.lastActive,
          isOnline: userData.isOnline,
          onlineStatus: userData.onlineStatus
        });
      }
    });
    
    // Limit to 10 users
    const limitedUsers = users.slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: limitedUsers
    });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting users for discovery'
    });
  }
});

// Like a user
router.post('/like', auth, validateLike, asyncHandler(async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase not available'
      });
    }

    const { userId } = req.body;
    const currentUserId = req.user.id;
    
    // Get target user
    const targetUserDoc = await db.collection('users').doc(userId).get();
    if (!targetUserDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const targetUser = targetUserDoc.data();
    const currentUser = req.user;
    
    // Add to liked users
    const currentUserLiked = currentUser.likedUsers || [];
    if (!currentUserLiked.includes(userId)) {
      currentUserLiked.push(userId);
      await db.collection('users').doc(currentUserId).update({
        likedUsers: currentUserLiked
      });
    }
    
    // Check if it's a match (target user also liked current user)
    const targetUserLiked = targetUser.likedUsers || [];
    const isMatch = targetUserLiked.includes(currentUserId);
    
    if (isMatch) {
      // Add to matches for both users
      const currentUserMatches = currentUser.matches || [];
      const targetUserMatches = targetUser.matches || [];
      
      if (!currentUserMatches.includes(userId)) {
        currentUserMatches.push(userId);
        await db.collection('users').doc(currentUserId).update({
          matches: currentUserMatches
        });
      }
      
      if (!targetUserMatches.includes(currentUserId)) {
        targetUserMatches.push(currentUserId);
        await db.collection('users').doc(userId).update({
          matches: targetUserMatches
        });
      }
    }
    
    res.status(200).json({
      success: true,
      match: isMatch,
      matchedUser: isMatch ? {
        id: userId,
        name: targetUser.name,
        age: targetUser.age,
        location: targetUser.location,
        profilePhoto: targetUser.profilePhoto
      } : null
    });
  } catch (error) {
    console.error('Like error:', error);
    throw error;
  }
}));

// Pass on a user
router.post('/pass', auth, validateLike, asyncHandler(async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase not available'
      });
    }

    const { userId } = req.body;
    const currentUser = req.user;
    
    // Add to passed users
    const passedUsers = currentUser.passedUsers || [];
    if (!passedUsers.includes(userId)) {
      passedUsers.push(userId);
      await db.collection('users').doc(req.user.id).update({
        passedUsers: passedUsers
      });
    }
    
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Pass error:', error);
    throw error;
  }
}));

// Get user's matches
router.get('/matches', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        success: false,
        message: 'Firebase not available'
      });
    }

    const currentUser = req.user;
    const matchIds = currentUser.matches || [];
    
    if (matchIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Get match user details
    const matches = [];
    for (const matchId of matchIds) {
      const matchDoc = await db.collection('users').doc(matchId).get();
      if (matchDoc.exists) {
        const matchData = matchDoc.data();
        matches.push({
          id: matchId,
          name: matchData.name,
          age: matchData.age,
          location: matchData.location,
          profilePhoto: matchData.profilePhoto
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: matches
    });
  } catch (error) {
    console.error('Matches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting matches'
    });
  }
});

// Send heart to a user
router.post('/send-heart', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({
        success: true,
        message: 'Heart sent successfully (Firebase not available)'
      });
    }

    const { userId, message } = req.body;
    
    // Get target user
    const targetUserDoc = await db.collection('users').doc(userId).get();
    if (!targetUserDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const targetUser = targetUserDoc.data();
    const receivedHearts = targetUser.receivedHearts || [];
    
    const heart = {
      fromUserId: req.user.id,
      message: message || 'Te envió un corazón 💖',
      timestamp: new Date(),
      seen: false
    };
    
    receivedHearts.push(heart);
    await db.collection('users').doc(userId).update({
      receivedHearts: receivedHearts
    });
    
    res.status(200).json({
      success: true,
      message: 'Heart sent successfully'
    });
  } catch (error) {
    console.error('Send heart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending heart'
    });
  }
});

// Get received hearts
router.get('/hearts', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const currentUser = req.user;
    const receivedHearts = currentUser.receivedHearts || [];
    
    // Get sender details for each heart
    const heartsWithSenders = [];
    for (const heart of receivedHearts) {
      const senderDoc = await db.collection('users').doc(heart.fromUserId).get();
      if (senderDoc.exists) {
        const senderData = senderDoc.data();
        heartsWithSenders.push({
          ...heart,
          fromUser: {
            id: heart.fromUserId,
            name: senderData.name,
            age: senderData.age,
            location: senderData.location,
            profilePhoto: senderData.profilePhoto
          }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: heartsWithSenders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  } catch (error) {
    console.error('Get hearts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting hearts'
    });
  }
});

// Mark hearts as seen
router.put('/hearts/mark-seen', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({
        success: true,
        message: 'Hearts marked as seen (Firebase not available)'
      });
    }

    const { heartIds } = req.body;
    const currentUser = req.user;
    const receivedHearts = currentUser.receivedHearts || [];
    
    // Mark specified hearts as seen
    receivedHearts.forEach(heart => {
      if (heartIds.includes(heart.fromUserId)) {
        heart.seen = true;
      }
    });
    
    await db.collection('users').doc(req.user.id).update({
      receivedHearts: receivedHearts
    });
    
    res.status(200).json({
      success: true,
      message: 'Hearts marked as seen'
    });
  } catch (error) {
    console.error('Mark hearts seen error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking hearts as seen'
    });
  }
});

// Block a user
router.post('/block', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({
        success: true,
        message: 'User blocked successfully (Firebase not available)'
      });
    }

    const { userId } = req.body;
    const currentUser = req.user;
    const blockedUsers = currentUser.blockedUsers || [];
    
    if (!blockedUsers.includes(userId)) {
      blockedUsers.push(userId);
      await db.collection('users').doc(req.user.id).update({
        blockedUsers: blockedUsers
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error blocking user'
    });
  }
});

// Unblock a user
router.post('/unblock', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({
        success: true,
        message: 'User unblocked successfully (Firebase not available)'
      });
    }

    const { userId } = req.body;
    const currentUser = req.user;
    const blockedUsers = currentUser.blockedUsers || [];
    
    const updatedBlockedUsers = blockedUsers.filter(
      blockedId => blockedId !== userId
    );
    
    await db.collection('users').doc(req.user.id).update({
      blockedUsers: updatedBlockedUsers
    });
    
    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error unblocking user'
    });
  }
});

// Get blocked users
router.get('/blocked', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const currentUser = req.user;
    const blockedUserIds = currentUser.blockedUsers || [];
    
    if (blockedUserIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    // Get blocked user details
    const blockedUsers = [];
    for (const userId of blockedUserIds) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        blockedUsers.push({
          id: userId,
          name: userData.name,
          age: userData.age,
          location: userData.location,
          profilePhoto: userData.profilePhoto
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: blockedUsers
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting blocked users'
    });
  }
});

// Update user online status
router.post('/status', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({
        success: true,
        data: {
          onlineStatus: 'offline',
          isOnline: false,
          lastActive: new Date()
        }
      });
    }

    const { status } = req.body; // 'online', 'away', 'offline'
    const updateData = {
      onlineStatus: status,
      isOnline: status === 'online',
      lastActive: new Date()
    };
    
    await db.collection('users').doc(req.user.id).update(updateData);
    
    res.status(200).json({
      success: true,
      data: updateData
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating status'
    });
  }
});

// Get online users only
router.get('/online', auth, async (req, res) => {
  try {
    if (!db) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const currentUser = req.user;
    
    // Get online users that haven't been liked or passed by current user
    const excludedIds = [
      req.user.id,
      ...(currentUser.likedUsers || []),
      ...(currentUser.passedUsers || [])
    ];
    
    // Get all users from Firestore and filter for online users
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const userId = doc.id;
      
      // Filter for online users that haven't been excluded and match age preferences
      if (!excludedIds.includes(userId) && 
          userData.isOnline === true &&
          userData.onlineStatus === 'online' &&
          userData.age >= (currentUser.agePreference?.min || 18) &&
          userData.age <= (currentUser.agePreference?.max || 100)) {
        users.push({
          id: userId,
          uid: userId,
          name: userData.name,
          age: userData.age,
          location: userData.location,
          genderIdentity: userData.genderIdentity,
          sexualOrientation: userData.sexualOrientation,
          bio: userData.bio,
          interests: userData.interests,
          profilePhoto: userData.profilePhoto,
          lastActive: userData.lastActive,
          isOnline: userData.isOnline,
          onlineStatus: userData.onlineStatus
        });
      }
    });
    
    // Limit to 10 users
    const limitedUsers = users.slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: limitedUsers
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting online users'
    });
  }
});

module.exports = router;