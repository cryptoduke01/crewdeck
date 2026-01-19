-- Insert sample agencies with realistic names
INSERT INTO agencies (name, slug, niche, description, location, verified, rating, review_count, price_range_min, price_range_max, team_size, founded)
VALUES
  ('Blockchain Ventures Marketing', 'blockchain-ventures-marketing', 'DeFi', 'Specialized DeFi marketing firm helping protocols launch, scale communities, and drive sustainable growth through proven strategies.', 'Remote', true, 4.8, 142, 8000, 35000, '12-18', 2020),
  ('Digital Asset Collective', 'digital-asset-collective', 'NFT', 'Full-service NFT marketing agency focused on collection launches, community building, and influencer partnerships.', 'Los Angeles, US', true, 4.9, 203, 12000, 60000, '15-22', 2019),
  ('Web3 Growth Labs', 'web3-growth-labs', 'Web3', 'Data-driven marketing agency for Web3 projects. We combine growth hacking, content strategy, and community engagement.', 'San Francisco, US', true, 4.7, 98, 10000, 50000, '10-15', 2021),
  ('Token Marketing House', 'token-marketing-house', 'DeFi', 'Expert token marketing and launch services for DeFi protocols. Proven track record with multiple successful launches.', 'New York, US', true, 5.0, 187, 15000, 80000, '18-25', 2018),
  ('Crypto Native Media', 'crypto-native-media', 'Web3', 'Marketing and PR agency built by Web3 natives, for Web3 projects. We understand the ecosystem inside and out.', 'Austin, US', true, 4.6, 76, 7000, 30000, '8-12', 2022),
  ('Metaverse Marketing Group', 'metaverse-marketing-group', 'Gaming', 'Specialized marketing for gaming and metaverse projects. We help brands build presence in virtual worlds.', 'Seattle, US', true, 4.8, 134, 10000, 45000, '14-20', 2020);

-- Insert services for Blockchain Ventures Marketing
INSERT INTO services (name, agency_id)
SELECT 'Token Launch Strategy', id FROM agencies WHERE slug = 'blockchain-ventures-marketing'
UNION ALL
SELECT 'Community Management', id FROM agencies WHERE slug = 'blockchain-ventures-marketing'
UNION ALL
SELECT 'Content Strategy', id FROM agencies WHERE slug = 'blockchain-ventures-marketing'
UNION ALL
SELECT 'Influencer Partnerships', id FROM agencies WHERE slug = 'blockchain-ventures-marketing';

-- Insert services for Digital Asset Collective
INSERT INTO services (name, agency_id)
SELECT 'NFT Launch Campaigns', id FROM agencies WHERE slug = 'digital-asset-collective'
UNION ALL
SELECT 'Community Building', id FROM agencies WHERE slug = 'digital-asset-collective'
UNION ALL
SELECT 'Social Media Management', id FROM agencies WHERE slug = 'digital-asset-collective'
UNION ALL
SELECT 'Influencer Marketing', id FROM agencies WHERE slug = 'digital-asset-collective'
UNION ALL
SELECT 'PR & Media Relations', id FROM agencies WHERE slug = 'digital-asset-collective';

-- Insert services for Web3 Growth Labs
INSERT INTO services (name, agency_id)
SELECT 'Growth Hacking', id FROM agencies WHERE slug = 'web3-growth-labs'
UNION ALL
SELECT 'Marketing Analytics', id FROM agencies WHERE slug = 'web3-growth-labs'
UNION ALL
SELECT 'Performance Marketing', id FROM agencies WHERE slug = 'web3-growth-labs'
UNION ALL
SELECT 'Brand Strategy', id FROM agencies WHERE slug = 'web3-growth-labs';

-- Insert services for Token Marketing House
INSERT INTO services (name, agency_id)
SELECT 'Token Launch Marketing', id FROM agencies WHERE slug = 'token-marketing-house'
UNION ALL
SELECT 'Exchange Listings', id FROM agencies WHERE slug = 'token-marketing-house'
UNION ALL
SELECT 'Market Making Support', id FROM agencies WHERE slug = 'token-marketing-house'
UNION ALL
SELECT 'Investor Relations', id FROM agencies WHERE slug = 'token-marketing-house';

-- Insert services for Crypto Native Media
INSERT INTO services (name, agency_id)
SELECT 'Content Creation', id FROM agencies WHERE slug = 'crypto-native-media'
UNION ALL
SELECT 'Social Media', id FROM agencies WHERE slug = 'crypto-native-media'
UNION ALL
SELECT 'Podcast Production', id FROM agencies WHERE slug = 'crypto-native-media'
UNION ALL
SELECT 'Thought Leadership', id FROM agencies WHERE slug = 'crypto-native-media';

-- Insert services for Metaverse Marketing Group
INSERT INTO services (name, agency_id)
SELECT 'Metaverse Integration', id FROM agencies WHERE slug = 'metaverse-marketing-group'
UNION ALL
SELECT 'Gaming Community Management', id FROM agencies WHERE slug = 'metaverse-marketing-group'
UNION ALL
SELECT 'Virtual Events', id FROM agencies WHERE slug = 'metaverse-marketing-group'
UNION ALL
SELECT 'Partnership Development', id FROM agencies WHERE slug = 'metaverse-marketing-group';

-- Insert portfolio items for Blockchain Ventures Marketing
INSERT INTO portfolio (title, description, metrics, agency_id)
SELECT 
  'DeFi Protocol Launch Campaign',
  'Successfully launched a DeFi lending protocol that achieved $150M TVL within 60 days through strategic community building and content marketing.',
  '$150M TVL, 85K community members',
  id 
FROM agencies WHERE slug = 'blockchain-ventures-marketing'
UNION ALL
SELECT 
  'DEX Growth Initiative',
  'Helped a decentralized exchange increase monthly active users by 400% through targeted growth marketing campaigns.',
  '400% user growth, 2M+ monthly volume',
  id 
FROM agencies WHERE slug = 'blockchain-ventures-marketing';

-- Insert portfolio items for Digital Asset Collective
INSERT INTO portfolio (title, description, metrics, agency_id)
SELECT 
  'NFT Collection Launch',
  'Managed full marketing campaign for blue-chip NFT collection that sold out in 4 hours and reached 50K+ floor price.',
  'Sold out in 4 hours, 50K+ floor',
  id 
FROM agencies WHERE slug = 'digital-asset-collective'
UNION ALL
SELECT 
  'Community Growth Program',
  'Built and managed Discord community that grew from 1K to 100K active members in 6 months.',
  '100K members, 95% retention rate',
  id 
FROM agencies WHERE slug = 'digital-asset-collective';

-- Insert portfolio items for Web3 Growth Labs
INSERT INTO portfolio (title, description, metrics, agency_id)
SELECT 
  'Web3 Platform Launch',
  'Designed and executed go-to-market strategy for Web3 social platform that onboarded 500K users in first quarter.',
  '500K users, $10M raised',
  id 
FROM agencies WHERE slug = 'web3-growth-labs';

-- Insert portfolio items for Token Marketing House
INSERT INTO portfolio (title, description, metrics, agency_id)
SELECT 
  'Token Launch & Listing Campaign',
  'Managed complete token launch from pre-sale marketing to CEX listings, achieving $75M fundraising goal.',
  '$75M raised, 3 CEX listings',
  id 
FROM agencies WHERE slug = 'token-marketing-house';
