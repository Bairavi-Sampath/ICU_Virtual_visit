# ICU Virtual Visit - Complete Testing Guide

## ✅ System Ready for Testing

Your video conference system is now fully configured and ready to test!

---

## 🧪 TEST 1: Single Device Test (Browser Tabs)

### Step 1: Open Two Browser Tabs
1. Open **Tab 1** → `http://localhost:3000`
2. Open **Tab 2** → `http://localhost:3000` (same window or new window)

### Step 2: Simulate Nurse & Family
- **Tab 1**: Login as Nurse
  - Username: `nurse_sarah`
  - Password: `nurse1234`
  - Role: `nurse`
  - Click "Login"

- **Tab 2**: Login as Family
  - Username: `family_john`
  - Password: `family1234`
  - Role: `family`
  - Click "Login"

### Step 3: Start Video Call
- **Tab 1 (Nurse Dashboard)**:
  - Find patient "John Smith" (ICU-101)
  - Click **"Call"** button
  - Wait for redirect...

### Step 4: Jitsi Meeting Opens
You should see:
- ✅ Meeting loads immediately (NO moderator wait!)
- ✅ "Icu Visit 1" room name displayed
- ✅ Jitsi interface loads
- ✅ Camera/Microphone permission requests

### Step 5: Allow Permissions
- Click **"Allow"** for camera
- Click **"Allow"** for microphone
- Wait 2-3 seconds for video to start

### Step 6: Test Audio & Video
- **Smile at camera** - You should see your video feed
- **Speak into mic** - Test if audio captures sound
- **Adjust** - Use Jitsi mute/unmute buttons

---

## 🧪 TEST 2: Two Devices/Users (BEST TEST!)

### Setup:
- **Device 1 (Laptop)**: Nurse dashboard
- **Device 2 (Phone/Tablet)**: Family member

### Step 1: Both on Same Network
```
Make sure both devices are on the same WiFi
Get your laptop IP:
  Windows: ipconfig -> IPv4 Address (e.g., 192.168.1.100)
```

### Step 2: Open App on Both Devices
- **Laptop**: `http://localhost:3000`
- **Phone**: `http://LAPTOP_IP:3000`
  (Replace LAPTOP_IP with actual IP, e.g., `http://192.168.1.100:3000`)

### Step 3: Login on Both
- **Laptop**: Nurse login
- **Phone**: Family login

### Step 4: Nurse Starts Call
- Laptop: Click "Call" on John Smith
- Jitsi opens in new tab on laptop

### Step 5: Family Joins (Option A - Manual)
- Phone: Go back to dashboard
- Phone: Should see "Join" button (not "Call") - click it
- Phone: Joins SAME Jitsi room automatically

### Step 6: VERIFY - Can You See Each Other?
✅ Laptop video shows in Jitsi
✅ Phone video shows in Jitsi  
✅ Can speak to each other
✅ Both mute/unmute buttons work
✅ Can share screen (advanced feature)

---

## 📊 Expected Results

### ✅ Should SEE:
- Jitsi Meet opens instantly (no wait screen)
- Room name: "Icu Visit 1"
- Your own video feed
- Participant avatars when connected
- Mute/unmute/camera buttons
- Share screen button
- Call timer

### ✅ Should HEAR:
- Your own audio when you speak
- Other person's audio when they speak
- No delays or lag
- Clear quality

### ✅ Should NOT SEE:
- ❌ "Waiting for moderator"
- ❌ Login screen
- ❌ "Conference not started" message
- ❌ Errors

### ✅ Database Should Track:
- Visit created in DB
- Call duration logged
- Visit status changed to "active"

---

## 🛠️ Troubleshooting

### Problem: Still seeing "Asking to join meeting..."
**Solution**: 
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Check if config parameters loaded: Look at URL - should have `#config.start...`

### Problem: No camera/microphone visible
**Solution**:
- Click **"Allow"** when browser asks for permissions
- Check camera is not in use by another app
- Try different browser (Chrome recommended)

### Problem: Audio not working
**Solution**:
- Check microphone is selected in Jitsi settings
- Unmute button - green mic icon should show
- Test in browser settings if mic works

### Problem: Can't see other person
**Solution**:
- Make sure both users in SAME room (room name matches)
- Wait 3-5 seconds for video to initialize
- Click camera icon to turn on video

---

## 📱 Two-Device Testing (Recommended!)

**Best way to verify it actually works:**

Device 1 (Laptop):
```
- Run: http://localhost:3000
- Login as: nurse_sarah
- Click Call → See your video
```

Device 2 (Phone on same WiFi):
```
- Run: http://LAPTOP_IP:3000 (replace with actual IP)
- Login as: family_john
- Click Join → See nurse's video, nurse sees yours
- Have a real conversation!
```

---

## ✅ Checklist

- [ ] Tab 1 opens app
- [ ] Tab 2 opens app
- [ ] Tab 1 login successful
- [ ] Tab 2 login successful
- [ ] Tab 1 "Call" button works
- [ ] Jitsi opens immediately
- [ ] Permissions requested
- [ ] Camera shows video
- [ ] Microphone captures audio
- [ ] Both users can speak
- [ ] No moderator wait screen
- [ ] Room name correct
- [ ] Database shows visit created

✅ **ALL WORKING?** → DEMO READY! 🎉

---

## 🎬 Demo Checklist

Before showing stakeholders:
- [ ] Test on 2 devices
- [ ] Verify audio quality
- [ ] Verify video quality
- [ ] Check internet speed acceptable
- [ ] Prepare 2 demo accounts
- [ ] Know how to start/end call
- [ ] Know how to troubleshoot if needed

---

## 📞 Need Help?

If something doesn't work:
1. Check browser console (F12)
2. Test API directly: `http://localhost:3000/api/patients/1/call`
3. Verify database connected
4. Verify Jitsi is accessible: `https://meet.jit.si/test-room`
5. Clear browser cache and try again

---

**Good luck with testing! You've got a working telemedicine system!** 🚀
