from django.urls import path

from . import views

urlpatterns = [
    path('users/', views.UserList.as_view()),
    path('users/<int:pk>/', views.UserDetail.as_view()),
    path('cycles/', views.CycleList.as_view()),
    path('cycles/<int:pk>/', views.CycleDetail.as_view()),
    path('click/', views.call_click, name="click"),
    path('buyBoost/', views.buy_boost, name="buyBoost"),
    path('boosts/<int:mainCycle>/', views.BoostList.as_view()),
    path('set_maincycle/', views.set_maincycle),
]
