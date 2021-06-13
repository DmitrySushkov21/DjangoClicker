from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import MainCycle, Boost
from .serializers import UserSerializer, UserSerializerDetail, CycleSerializer, CycleSerializerDetail, BoostSerializer


class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class CycleList(generics.ListAPIView):
    queryset = MainCycle.objects.all()
    serializer_class = CycleSerializer


class BoostList(generics.ListAPIView):
    queryset = Boost
    serializer_class = BoostSerializer

    def get_queryset(self):
        return Boost.objects.filter(mainCycle=self.kwargs['mainCycle'])


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializerDetail


class CycleDetail(generics.RetrieveAPIView):
    queryset = MainCycle.objects.all()
    serializer_class = CycleSerializerDetail


@api_view(['GET'])
def call_click(request):
    mainCycle = MainCycle.objects.get(user=request.user)
    is_level_up = mainCycle.Click()
    boosts_query = Boost.objects.filter(mainCycle=mainCycle)
    boosts = BoostSerializer(boosts_query, many=True).data
    mainCycle.save()
    if is_level_up:
        return Response({"coinsCount": mainCycle.coinsCount,
                         "boosts": boosts})

    return Response({"coinsCount": mainCycle.coinsCount,
                     "boosts": None})


@api_view(['POST'])
def buy_boost(request):
    boost_level = request.data['boost_level']
    cycle = MainCycle.objects.get(user=request.user)
    boost = Boost.objects.get_or_create(mainCycle=cycle, level=boost_level)[0]
    main_cycle, level, price, power, boost_type = boost.upgrade()
    boost.save()
    return Response({'clickPower': main_cycle.clickPower,
                     'coinsCount': main_cycle.coinsCount,
                     'autoClickPower': main_cycle.autoClickPower,
                     'level': level,
                     'price': price,
                     'power': power,
                     'boost_type': boost_type})


@api_view(['POST'])
def set_maincycle(request):
    user = request.user
    data = request.data
    MainCycle.objects.filter(user=user).update(coinsCount=data['coinsCount'])
    return Response({'success': 'ok'})
