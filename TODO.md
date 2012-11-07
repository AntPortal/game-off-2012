Note, this file contains spoilers for the plot of the game.

Scene Layout
============

* **Loading**: Loads all assets, transitions to (Video Intro)
* **Video Intro**: TODO. Transitions to (Title)
* **Title**: Shows game name in big font, and a "click to start" caption. When clicked, game name pans upwards, and 3 save slots appear. Click on an empty slot transitions to (Save creation); otherwise the other slots transition to the appropriate level.
* **Save creation**: Prompt user for name (github name if possible), gender, birth date. Transitions to (Level 1-Intro)
* **Level 1-Intro**: Interior bedroom. Mom tries to wake hero, who asks for 5 more minutes. Hero realizes he's for the concert today; his favorite band is playing. Jumps out of bed to rush to the concert. Mom stops him and reminds him that he has to deliver the newspapers today. Hero whines about how he can't do both. Transitions to (Level 1)
* **Level1**: Exterior, peaceful village. Hero has 4 turns to deliver the newspaper to 6 houses and attend the concert. Solution is to fork, spend 3 turns on 3 houses in each branch, and then reunite at the village exit to get to the concert. One of the houses belongs to an old lady and a dog. When you deliver the paper to her, she tries to regale you with tales about how she was an adventurer. Transitions to (Level 2-Intro)
* **Level 2-Intro**: Exterior, forest path. The hero spots some goblins waiting in ambush to take out some royal soldiers. The hero cries out in warning, and a battle commences.
* **Level 2**: TODO Figure out an appropriate puzzle combat here. At the end, one of the soldiers remarks on the hero's strange forking power and says that he should follow her to see the king, to see if this power can help turn the coming war.
* **Level 3-Intro**: Interior, evil throne room: A minion comes up to the dark shadow lord and informs him that they have found the boy/girl (i.e. the hero) with the forking power.
* **Level 3**: The soldier brings the hero to the king, but the king is unconvinced ("This is but a child!" etc.), when the castle is attacked. The soldier says that this is the hero's chance to prove themselves, and says that they'll follow the hero's orders, since the hero's the only one who can see what's going on, on the two branches simultaneously. TODO: Flesh out the puzzle battle.
* **Level 4-Intro**: Interior, good throne room. The king is convinced that the hero has great power, and explains that although no official war has been declared, monster attacks have increased dramatically. They have been trying to send a party to seek out the advice of the wise old hermit, but they didn't have the manpower to do it yet. But seeing your ability, the King believes you can compensate for the weak party that he can afford to send, and asks you to lead it to the hermit.
  * Extra idea: The King asks the hero "Are you willing to help us?" If the hero says no, everyone is very upset, and the hero is called treasonous and sentenced to death. The hero will have to go back to immediately before the question, fork, and choose "yes" this time. Perhaps the gitk display can show an "x" instead of an "o" to indicate a timeline in which the hero dies, e.g.:
        O--O--O--X
               `-O--O--O
* **Level 4**: Exterior, plain: The party is attacked by monsters. TODO: Flesh out the battle here. I'm thinking maybe a gargoyle type monster who's obviously the leader who taunts the hero, foreshadowing that he's falling into a trap.
* **Level 5-Intro**: The party reaches the old hermit, who tells the party that there's this prophecy that foretold the arrival of this hero, the only person in the universe who can create branching alternatives of the universe. He then asks if the hero has ever forked for trivial reasons (Perhaps hero's choices are "No." and "N...no..."). The hermit warns that forking is actually very dangerous, as constant tearing and remerging will weaken the fabric of space-time, and that the hero should only use the ability in emergencies. The soldier asks if the hermit has any advice on the monster attacks; the hermit gives them a blue orb, the Karayom. The hermit, thinking out loud, says that in more peaceful times, he would have loved to adopt the hero as his disciple, so that they may study this power together. Thinking out loud, the hermit compares the forking ability to time travel, noting how you could use it to undo your past mistakes (TODO flesh out this dialog), when suddenly the gargoyle monster appears again, tells the hermit he talks too much, and cuts him. The soldier tells the hero to use the fork ability to save the hermit, but the hermit says "No! Waste it not on an old man like me. I have lived a full life, and I've told you what you need to kn-" with the Gargoyle interrupting "Shaddap!" and kills him for good.
* **Level 5**: TODO Come up with a puzzle battle here; Perhaps one which is actually solvable without forking. When the battle is over, the soldier says "We better deliver this news back to the king."
* **Level 6-Intro**: TODO flesh this out.
  * Arrive back to king's room, but find everyone is dead. Soldier tells hero to fork back to before they left for the hermit to find out what happened. There's a bit of an argument among the rest of the party, but the soldier states this is clearly a big enough emergency to warrant forking.
  * When the hero does fork, he's back at the King asking "Are you willing to help us?", but then, instead of presenting the player with the dialog choice, the king continues "Wait, how did you get (that item that the hermit gave you)?"
  * Dialog pops up "Gave King the item."
  * The soldier catches on quickly "Could it be that the hero had already visited the hermit in another branch?"
  * The King says "Brilliant! I never would have imagined your ability would be so powerful! Quick! Tell us what the hermit told you." 
  * An unknown voice "Oh, so we're in *that* branch..."
  * Everyone: "???"
  * The unknown voice is the gargoyle: "My boss told me to hide here in the throne room, to find out which branch I'm in. If you were to head off to the hermit, I'm supposed to follow you! But if I'm in the branch where you somehow already visited the hermit, I'm supposed to do this!"
  * Gargoyle zaps the king, a column of light surrounds him, and the blue orb starts orbiting around the column, and the king turns into a skeleton.
* **Level 6**: TODO flesh this out. It's a battle, but the battle is hopeless. The gargoyle hides in some unreachable spot, and every turn, he uses the blue orb to transform someone in the room into a skeleton to fight on his side. The intent is to get the player to waste a few more forks before giving up. Combat ends once everybody (except the hero) has been turned into a skeleton.
* **Level 7-Intro**: The hero is taken to the Lord of Shadow's castle, chained up in the dungeon. TODO: Flesh out the dialog.
  * The idea is that the Lord of Shadow is going to torture the hero, and force him to fork. At each commit node, LoS tells the hero to fork, and then if he doesn't kills him. Thus the gitk display will probably look something like:
        O--X
         `-O--X
            `-O--X
               `-O
  * TODO flesh out the exposition, but basically the Lord of Shadows *is* the hero, which is why he's able to know what happened on alternative branches, but nobody else in the universe is able to do it. The LoS is the "original", and the hero is a clone the LoS created, because every time the hero forks the universe, the LoS becomes more powerful.
* **TODO** Flesh out these ideas
  * The hero escapes with the help of the old lady from level 1, the one with the dog.
  * Regrabs blue orb on the way out.
  * She's too old to make it all the way out of the dungeon. You have to go on without her. Please take care of the dog.
  * Maybe revisit the hermit in an older branch?
  * Quantum immortality: The hero can't die 'cause via anthropic principle, he will only ever observe himself to be on branches where he is still alive. Similarly, while you can (in theory) kill LoS on one branch, there will always be some other branch where he is still alive, doing evil.
  * Have to "merge" LoS back into himself to stop LoS on all branches.
    * This should involve that blue orb from before, somehow.
    * This should also involve "external universes", somehow.
    * Word association: karayom -> kara yomu -> from read -> git remotes.
    * The karayom is what lets you add remote repos, pulling in objects from other universes.
    * Need to know the 'location' to pull in from.
  * Try to pull in some remotes to help stop LoS.
    * Perhaps based on the repos associated with the user's account: http://developer.github.com/v3/repos/#list-user-repositories
  * Accidentally pull in Cthulhu (not literally, TODO come up with our own name)
  * LoS agrees to merge with hero in order to team up and fight Cthulhu, devourer of all worlds
  * LoS+Hero still not strong enough. Need to pull in more power, but ran out of locations. Think, is there one more universe out there that we haven't tapped yet?
  * In climax, use HTML5 geolocation API, so user gets a "Allow Karayom to use your location?" prompt.
  * User clicks "yes", this is enough to push back Cthulhu.
  * Ending credits.
  * Cthulhu is now in our world, to be continued...

BUGS
====
* Get better graphic for tooltips.
* Find arrows to replace red squares in scroll box.
* Tweak behaviour of gitk scrolling for when you have many forks.
* Consider moving gitk UI to top of screen instead of bottom.
* Add ability to resize gitk UI.
* Need a click areamap for stairs and slopes.
* (DONE) Need a click areamap for stairs and slopes.
* Fix draw ordering (Hasan)
* Need to add pathing rules, so that you can't walk onto tiles with noStand = true, and you can't walk from a tile of height 0 to an adjacent tile of height > 0.5 (i.e. you can walk up slopes, but not up walls).
  * As part of this, you'll probably want to add an A* path finding algorithm. 
* Volume controls don't work on ipad.
* Optimize rotation effect on commit markers.
* When forking, check all existing children to see if there's an identical match. If there is, instead of creating a new child, just reuse that existing one.
* Add a timer so that if the user is stuck on a level for more than, e.g. 30 seconds, the tooltip icon starts flashing.
* Add some sort of UI to indicate turn limit (maybe a skull and a vertical line on the gitk layer? Maybe if you click on it, it explains why there's a time limit in the story?)
* Add support for IE.
