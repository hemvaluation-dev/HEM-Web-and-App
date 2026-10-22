import 'dart:async';
import 'package:geolocator/geolocator.dart';

class AccurateLocation {
  static Future<Position> capture() async {
    if (!await Geolocator.isLocationServiceEnabled()) {
      throw StateError('Turn on the phone location service and try again.');
    }
    final first = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.best,
        timeLimit: Duration(seconds: 25),
      ),
    );
    if (first.accuracy > 0 && first.accuracy <= 10) return first;
    return improve(
      first,
      Geolocator.getPositionStream(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.best,
          distanceFilter: 0,
        ),
      ),
    );
  }

  /// A fixed deadline prevents a continuous GPS stream from extending the wait.
  /// Coordinates always come from the device, never from a map/place centroid.
  static Future<Position> improve(
    Position first,
    Stream<Position> updates, {
    Duration wait = const Duration(seconds: 8),
  }) async {
    var best = first;
    final result = Completer<Position>();
    final timer = Timer(wait, () => result.complete(best));
    final subscription = updates.listen(
      (position) {
        if (position.timestamp.isBefore(
          first.timestamp.subtract(const Duration(seconds: 5)),
        )) {
          return;
        }
        if (!position.accuracy.isFinite || position.accuracy <= 0) return;
        if (!best.accuracy.isFinite ||
            best.accuracy <= 0 ||
            position.accuracy < best.accuracy) {
          best = position;
        }
        if (best.accuracy <= 10 && !result.isCompleted) result.complete(best);
      },
      onError: (Object _) {
        if (!result.isCompleted) result.complete(best);
      },
      onDone: () {
        if (!result.isCompleted) result.complete(best);
      },
    );
    try {
      return await result.future;
    } finally {
      timer.cancel();
      await subscription.cancel();
    }
  }
}
