import jwt from "jsonwebtoken";

const authentication = async (req, res, next) => {
  // 1. Token Extraction
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  // 2. Token Verification
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Basic Payload Validation
    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // 4. Optional: Add token revocation check here
    // const isRevoked = await checkTokenRevocation(decoded.userId, token);
    // if (isRevoked) return res.status(401).json({ message: "Token revoked" });

    // 5. Attach user context
    req.userId = decoded.userId;
    req.userRole = decoded.role; // If you include roles in your JWT
    req.token = token; // For potential downstream use

    next();
  } catch (err) {
    // 6. Specific error handling
    let message = "Authentication failed";

    if (err instanceof jwt.TokenExpiredError) {
      message = "Session expired, please login again";
    } else if (err instanceof jwt.JsonWebTokenError) {
      message = "Invalid authentication credentials";
    }

    return res
      .status(401)
      .set("WWW-Authenticate", "Bearer")
      .json({
        message,
        // Only expose error details in development
        ...(process.env.NODE_ENV === "development" && { detail: err.message }),
      });
  }
};

export default authentication;
