onresize = scrollToBottom;

// Prevent touch-based scrolling.
ontouchstart = function(event) { event.preventDefault(); };

var versionNumber = .310;
var versionText = "New seeded SHAREABLE random number generator!";

onload = function() {
  document.getElementById("Version").innerHTML=versionNumber + ' - ' + versionText;
  
  seed = GetSeed();
  
  var seedString = seed.toString(16).toUpperCase();
  var seedName = seedString.slice(0, 5) + '-' + seedString.slice(5)
    
  var Gimli = new Creature();
  
  Gimli.name     = "Gimli";
  Gimli.isUnique = true;
  Gimli.level    = 15;
  Gimli.attributes.str = 17;
  Gimli.attributes.dex = 13;
  Gimli.attributes.con = 17;
  Gimli.hitDieType = "d10";
  
  var hero = Gimli.make();

  hero.equipWeapon(Weapons.makeWeapon("greataxe"));
  hero.equipArmor(Armor.makeArmor("chainmail"));

  var Orc = new Creature();
  
  Orc.name  = "orc";
  Orc.level = 4;
  
  Orc.makeOrc = function() {
    Orc.attributes.roll3d6Ordered({str: 1, dex: 3, con: 2});
    Orc.attributes.str += 4;
    Orc.attributes.con += 1;  // Orcs should get an attribute advancement at 4.

    orc = this.make();
    
    orc.equipWeapon(Weapons.makeWeapon("random", Weapons.MEDIUMWEAPONS));
    orc.equipArmor(Armor.makeArmor("random", Armor.LIGHTARMORS));
    
    return orc;
  }
  
  var output = Output(hero);
  var view = Grammar.View();
  var narrator = Combat.Narrator(view, output);
  var attack = Combat.MeleeAttack(narrator);
  
  output.emit("start", hero.name + ": " + seedName + " slaps his " + 
	      hero.weapon.name + " against his " + hero.armor.name +
	      " eagerly!");
  output.pause(1);

  function combat(p1, p2) {
    var m = [[p1, p2], [p2, p1]];
    if (p2.check('dex') >= p1.check('dex'))
      m.reverse();
    
    output.emit("begin", p1.definiteName + " and " + p2.definiteName +
                " close in and begin to fight!");
    output.pause(2);

    function statusStr(creature) {
      return creature.name + ": " + creature.hp + "/" + creature.maxHp() +
             " HP AC " + creature.armorClass();
    }

    while (1) {
      output.emit("status", statusStr(p2) + "  " + statusStr(p1));
      for (var i = 0; i < m.length; i++) {
        var attacker = m[i][0];
        var defender = m[i][1];
        if (attacker.hp)
          attack.executeTurn(attacker, defender);
        if (defender.hp == 0) {
          output.emit("death", defender.definiteName + " has been killed!");
          return;
        }
        output.pause(3);
      }
    }
  }

  for (var count = 0; hero.hp > 0; count++) {
    var villian = Orc.makeOrc();
    output.emit("intro", villian.indefiniteName + " wielding " +
                villian.weapon.indefiniteName + " and wearing " + 
                villian.armor.name + " approaches!");
    combat(villian, hero);
    output.pause(3);
  }

  output.emit("conclusion", "After killing " + (count-1) + " " +
              villian.name + "s, " + hero.name + ": " + seedName + " died.");
  output.emit("link", "Share this <a href='http://boromir.maxmahem.net/?seed=" +
	      seedName + "'>Gimli's URL</a>, or roll a " + 
	      "<a href='http://boromir.maxmahem.net/'>new one!</a>")

  output.playback();
};
