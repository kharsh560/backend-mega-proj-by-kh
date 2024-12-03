// import the schema which are needed to write controllers in this file.
// NOTE: The schema which you import, have entire database access to themselves.
// Means, if you for wxample write user.create() -> then this user schema directly talks to the database
// and created desired new document in there.
// Or if you use: User.findByIdAndUpdate(userId,{$push:}) -> this will search the 'userId' in the User database
// and will update it with the info given here.

const registerUser = async (req, res) => {
  res.status(200).json({
    message: "Worked!",
  });
  // try {
  // } catch (error) {
  //     console.log("Error occured while registering the user.", error);
  // }
};

export { registerUser };
// not "export registerUser"

