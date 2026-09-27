import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const users = new Map();
const projects = new Map();

const creditsForSeconds = (seconds) => Math.ceil(seconds / 10) * 15;
const scenesForSeconds = (seconds) => Math.ceil(seconds / 10);

app.get('/health', (_req,res) => res.json({ok:true, service:'SANAPTAI Backend', version:'1.0.0'}));

app.post('/api/signup', (req,res) => {
  const {email} = req.body || {};
  if (!email) return res.status(400).json({error:'email is required'});
  if (users.has(email)) return res.status(409).json({error:'user already exists'});
  const user = {email, trialDays:30, dailyCredits:100, credits:100, lastClaimDate:new Date().toISOString().slice(0,10)};
  users.set(email,user);
  res.json({user});
});

app.get('/api/credits/:email', (req,res) => {
  const user = users.get(req.params.email);
  if (!user) return res.status(404).json({error:'user not found'});
  res.json({credits:user.credits, dailyCredits:user.dailyCredits, trialDays:user.trialDays});
});

app.post('/api/projects', (req,res) => {
  const {email,prompt,language='English',format='16:9',durationSeconds,style='Cinematic'} = req.body || {};
  if (!email || !prompt || !durationSeconds) return res.status(400).json({error:'email, prompt and durationSeconds are required'});
  const user = users.get(email);
  if (!user) return res.status(404).json({error:'user not found'});
  if (durationSeconds < 10 || durationSeconds > 1200) return res.status(400).json({error:'duration must be 10-1200 seconds'});
  const credits = creditsForSeconds(durationSeconds);
  if (user.credits < Math.min(credits, user.credits)) return res.status(400).json({error:'insufficient credits', requiredCredits:credits, availableCredits:user.credits});
  const id = 'proj_' + Date.now();
  const project = {id,email,prompt,language,format,durationSeconds,style,scenes:scenesForSeconds(durationSeconds),requiredCredits:credits,status:'queued',createdAt:new Date().toISOString()};
  user.credits = Math.max(0,user.credits-credits);
  projects.set(id,project);
  res.status(201).json(project);
});

app.get('/api/projects/:id', (req,res) => {
  const project = projects.get(req.params.id);
  if (!project) return res.status(404).json({error:'project not found'});
  res.json(project);
});

app.listen(process.env.PORT || 3000, () => console.log('SANAPTAI backend running'));
