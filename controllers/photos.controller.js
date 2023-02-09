const Photo = require('../models/photo.model');
const Vote = require('../models/Voter.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    const pattern = new RegExp(/(<\s*(strong|em|h1|h2|h3|h4|h5|h6)*>(([A-z]|\s)*)<\s*\/\s*(strong|em|h1|h2|h3|h4|h5|h6)>)|(([A-z]|\s|\.)*)/, 'g')
    const titleMatched = title.match(pattern).join('');
    const authorMatched = author.match(pattern).join('');

    if (titleMatched.length < title.length) throw new Error('Wrong input!');
    if (authorMatched.length < author.length) throw new Error('Wrong input!');

    if (title && author && email && file) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];

      if (title.lenght > 25) throw new Error('Wrong input!');
      if (author.lenght > 50) throw new Error('Wrong input!');

      if (fileExt === `gif` || fileExt === `jpg` || fileExt === `png`) {
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong input!');
      }


    } else {
      throw new Error('Wrong input!');
    }

  } catch (err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  const Votes = await Vote.findOne({ user: req.clientIp });

  if (Votes) {

    const userExist = Votes.filter(vote => vote.user === req.clientIp ? true : false);

    if (userExist.length) {
      const userVouted = userExist.votes.filter(vote => vote === req.files.file ? true : false);

      if (!userVouted.length) {
        const newVoter = new Vote({ user: req.clientIp, votes: [req.files.file] });
        await newVoter.save();
      }

    } else {
      const newVoter = new Vote({ user: req.clientIp, votes: [req.files.file] });
      await newVoter.save();
    }

  } else {
    const newVoter = new Vote({ user: req.clientIp, votes: [req.files.file] });
    await newVoter.save();
  }


  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }

};
