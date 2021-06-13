from django.contrib.auth.models import User
from django.db import models


class MainCycle(models.Model):
    user = models.ForeignKey(User, related_name='cycle', null=False, on_delete=models.CASCADE)

    coinsCount = models.IntegerField(default=0)
    autoClickPower = models.IntegerField(default=0)
    clickPower = models.IntegerField(default=1)
    level = models.IntegerField(default=0)

    def Click(self):
        self.coinsCount += self.clickPower
        return self.check_level()

    def check_level(self):
        if self.coinsCount > (self.level ** 2 + 1) * 1000:
            self.level += 1
            boost_type = 1
            if self.level % 3 == 0:
                boost_type = 0
            boost = Boost(mainCycle=self, boost_type=boost_type, level=self.level)
            boost.save()
            return True
        return False


class Boost(models.Model):
    mainCycle = models.ForeignKey(MainCycle, related_name='boosts', null=False, on_delete=models.CASCADE)
    level = models.IntegerField(null=False)
    power = models.IntegerField(default=1)
    price = models.IntegerField(default=10)
    boost_type = models.IntegerField(default=1)

    def upgrade(self):
        self.mainCycle.coinsCount -= self.price
        if self.boost_type == 1:
            self.mainCycle.clickPower += self.power
            self.price *= 2
        else:
            self.mainCycle.autoClickPower += self.power
            self.price *= 5
        self.power *= 2
        self.mainCycle.save()
        return (self.mainCycle,
                self.level,
                self.price,
                self.power,
                self.boost_type)

    def update_coins_count(self, current_coins_count):
        self.mainCycle.coinsCount += current_coins_count
        return self.mainCycle
