#include <iostream>
#include <vector>
#include <map>
using namespace std;

class station
{
public:
  string name;
  vector<string> routes;
};

class passenger
{
public:
  string name;
  int age;
  string destination;
  bool static comp(passenger a, passenger b)
  {
    return a.age < b.age;
  }
  int static priority_passenger(vector<passenger> passengers)
  {
    passenger r = passengers[0];
    int pos = 0;
    for (int i = 1; i < passengers.size(); i++)
    {
      if (comp(r, passengers[i]))
      {
        r = passengers[i];
        pos = i;
      }
    }
    return pos;
  }
};
class hyper_loop
{
  map<string, station> stations;
  vector<vector<string> > paths;
  vector<passenger> passengers;
  string start_stations;

public:
  void station_routes(string station)
  {
    for (string s : stations[station].routes)
    {
      cout << s << endl;
    }
  }
  void init(int no_of_routes)
  {
    string start, destination;
    cin >> start_stations;
    for (int i = 0; i < no_of_routes; i++)
    {
      cin >> start >> destination;
      if (stations.find(start) != stations.end())
      {
        stations[start].routes.push_back(destination);
      }
      else
      {
        station sta;
        sta.name = start;
        sta.routes.push_back(destination);
        stations[start] = sta;
      }
    }
  }
  vector<vector<string> > find_path_helper(vector<string> path, string destination)
  {
    for (string des : stations[path[path.size() - 1]].routes)
    {
      bool found = false;
      for (string path : path)
      {
        if (path == des)
        {
          found = true;
          break;
        }
      }
      if (found)
      {
        continue;
      }
      path.push_back(des);
      if (des == destination)
      {
        paths.push_back(path);
        path.pop_back();
      }
      else
      {
        find_path_helper(path, destination);
        path.pop_back();
      }
    }
    return paths;
  }
  vector<string> find_path(vector<string> path, string destination)
  {
    paths.clear();
    vector<vector<string> > paths = find_path_helper(path, destination);
    vector<string> effiecient_path;
    int len = INT_MAX;
    for (vector<string> path : paths)
    {
      if (len > path.size())
      {
        effiecient_path = path;
        len = path.size();
      }
    }
    return effiecient_path;
  }
  void add_passenger(int no_of_passengers)
  {
    for (int i = 0; i < no_of_passengers; i++)
    {
      passenger pas;
      cin >> pas.name >> pas.age >> pas.destination;
      passengers.push_back(pas);
    }
  }
  void start_pod(int no_of_pods)
  {
    for (int i = 0; i < no_of_pods && passengers.size() > 0; i++)
    {
      int pos = passenger::priority_passenger(passengers);
      passenger p = passengers[pos];
      vector<string> s;
      s.push_back(start_stations);
      vector<string> ef_pa = find_path(s, p.destination);
      cout << p.name << " " << p.age << " ";
      for (string path : ef_pa)
      {
        cout << path << " ";
      }
      cout << endl;
      passengers.erase(passengers.begin() + pos);
    }
  }
  void print_remaining_queue()
  {
    cout << passengers.size() << endl;
    for (passenger p : passengers)
    {
      cout << p.name << " " << p.age << endl;
    }
  }

  void execute_command(string command)
  {
    if (command == "INIT")
    {
      int param;
      cin >> param;
      init(param);
    }
    else if (command == "ADD_PASSENGER")
    {
      int param;
      cin >> param;
      add_passenger(param);
    }
    else if (command == "START_POD")
    {
      int param;
      cin >> param;
      start_pod(param);
    }
    else if (command == "PRINT_Q")
    {
      print_remaining_queue();
    }
  }
};

int main()
{
  string command;
  hyper_loop hl;
  while (cin >> command)
  {
    hl.execute_command(command);
  }
  return 0;
}
