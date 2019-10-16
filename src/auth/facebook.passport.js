import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth20';
import { Customer } from '../database/models';

require('dotenv').config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/facebook/redirect',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { displayName, emails, id } = profile;
        const newCustomer = {
          name: displayName,
          email: emails[0].value,
          password: id,
        };
        const customer = await Customer.scope('withoutPassword').findOrCreate({
          where: {
            email: profile.emails[0].value,
          },
          defaults: newCustomer,
        });
        await customer[0].reload();
        done(null, customer);
      } catch (error) {
        done(null, error);
      }
    }
  )
);
