import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { IUserRepository } from '../domain/repositories';

const configurePassport = (userRepo: IUserRepository) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
        proxy: true,
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email || !email.endsWith('@ucaldas.edu.co')) {
            return done(null, false, { message: 'Dominio no permitido' });
          }

          const userData = {
            uid: profile.id,
            name: profile.displayName || '',
            email: email,
            lastLogin: new Date(),
          };

          // Usar el repositorio inyectado para persistir
          await userRepo.save(profile.id, userData);
          return done(null, userData);
        } catch (error: unknown) {
          return done(error as Error, undefined);
        }
      }
    )
  );
};

export default configurePassport;
