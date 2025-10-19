// controllers/notificationPreferenceController.js

const NotificationPreference = require('../models/notificationPreference');


//GET Get user notification preference either sms, email, push
exports.getPreferences = async (req, res) => {
  try {
    const prefs = await NotificationPreference.findOne({ user: req.user.id });

    if (!prefs) {
      // create default prefs if not exist
      const newPrefs = await NotificationPreference.create({ user: req.user.id });
      return res.status(200).json(newPrefs);
    }

    res.status(200).json(prefs);

  } catch (error) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};

//UPDATE   Update user notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { channels, doNotDisturb, locale } = req.body;

    if (channels && Object.keys(channels).some(ch => !['sms', 'email', 'push', 'whatsapp', 'in_app'].includes(ch))) {
      return res.status(400).json({ message: 'Invalid channel type' });
    }

    const prefs = await NotificationPreference.findOneAndUpdate(
      { user: req.user.id },
      { channels, doNotDisturb, locale },
      { new: true, upsert: true }        //{ upsert: true } if user has no preferences yet, it creates one automatically.
    );

    res.status(200).json({ message: 'Preferences updated successfully', prefs });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};



//DELETE  Delete preference and reset preferences to default
exports.resetPreferences = async (req, res) => {
  try {
    await NotificationPreference.findOneAndDelete({ user: req.user.id });

    const defaultPrefs = await NotificationPreference.create({ user: req.user.id });
   
    res.status(200).json({ message: 'Preferences reset to default', prefs: defaultPrefs });
  
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};
