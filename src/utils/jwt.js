import jwt from 'jsonwebtoken';
import config from "@/config/config";

const secretKey = config.jwt.secretKey;

/**
 * @desc Function to sign a JWT
 * @param {object} payload - The payload to encode in the JWT
 * @param {object} [options] - Optional settings for the token (e.g., expiresIn)
 * @returns {string} - The signed JWT
 */
export const jwtSign = (payload, options = {}) => {
    return jwt.sign(payload, secretKey, options);
}

/**
 * @desc Function to verify a JWT
 * @param {string} token - The JWT to verify
 * @returns {Object} - The decoded payload if the token is valid.
 * @throws {Error} - If the token is invalid or expired
 */
export const jwtVerify = (token) => {
    return jwt.verify(token, secretKey);
}