const Event = require('../models/Event');
const User = require('../models/User');
const agenda = require('../services/agenda');

class EventController {
  async getAll(req, res) {
    const events = await Event.find();
    res.json(events);
  }

  async getUserEvents(req, res) {
    const events = await Event.find({ rsvps: req.user._id });
    res.json(events);
  }

  async create(req, res) {
    const event = new Event(req.body);
    await event.save();
    await this.scheduleEventReminders(event);
    res.json(event);
  }

  async update(req, res) {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await this.scheduleEventReminders(event);
    res.json(event);
  }

  async delete(req, res) {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  }

  async rsvp(req, res) {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.rsvps.includes(req.user._id)) {
      event.rsvps.push(req.user._id);
      event.rsvpCount += 1;
      await event.save();

      const user = await User.findById(req.user._id);
      if (user.phoneNumber) {
        await agenda.schedule(new Date(), 'send event reminder', {
          eventId: event._id,
          type: 'instant',
        });
      }
    }

    res.json({ message: 'RSVP successful', event });
  }

  async scheduleEventReminders(event) {
    const eventDate = new Date(event.date);
    const eventTime = event.time.split(':');
    eventDate.setHours(eventTime[0]);
    eventDate.setMinutes(eventTime[1]);

    const oneDayBefore = new Date(eventDate);
    oneDayBefore.setDate(eventDate.getDate() - 1);
    
    const oneHourBefore = new Date(eventDate);
    oneHourBefore.setHours(eventDate.getHours() - 1);

    // Schedule job one day before the event
    agenda.schedule(oneDayBefore, 'send event reminder', { eventId: event._id, type: 'day' });

    // Schedule job one hour before the event
    agenda.schedule(oneHourBefore, 'send event reminder', { eventId: event._id, type: 'hour' });
  }
}

module.exports = new EventController();
